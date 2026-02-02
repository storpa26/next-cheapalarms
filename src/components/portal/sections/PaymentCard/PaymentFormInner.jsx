import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../ui/button";
import { Spinner } from "../../../ui/spinner";
import { toast } from "sonner";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getWpNonceSafe } from "../../../../lib/api/get-wp-nonce";

/**
 * Payment Form Component (inside Stripe Elements)
 */
function PaymentFormInner({
  estimateId,
  locationId,
  inviteToken,
  amount,
  onSuccess,
  workflow,
  isAmountValid,
  stripeConfigured,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [stripeReady, setStripeReady] = useState(!!stripeConfigured);
  const [cardElementReady, setCardElementReady] = useState(false);
  const cardElementRef = useRef(null);

  useEffect(() => {
    setStripeReady(!!stripeConfigured);
  }, [stripeConfigured]);

  useEffect(() => {
    setClientSecret(null);
    setPaymentIntentId(null);
    setCardElementReady(false);
    setError(null);
  }, [amount, estimateId]);

  const shouldInitialize = workflow?.status === "accepted" || workflow?.status === "booked";

  const createPaymentIntent = useCallback(async () => {
    if (!amount || amount <= 0 || !isAmountValid) {
      setError("Please enter a valid payment amount");
      return null;
    }

    if (!stripeConfigured) {
      setError("Stripe is not configured. Missing publishable key.");
      return null;
    }

    setIsCreatingIntent(true);
    setError(null);

    try {
      const nonce = await getWpNonceSafe().catch(() => "");
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WP-Nonce": nonce || "" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          currency: "aud",
          estimateId,
          metadata: {
            estimateId,
            locationId,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.err || "Failed to create payment intent");
      }

      setCardElementReady(false);
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);

      setIsCreatingIntent(false);
      return data.clientSecret;
    } catch (err) {
      setError(err.message || "Failed to create payment intent");
      setIsCreatingIntent(false);
      toast.error("Payment initialization failed", {
        description: err.message,
      });
      return null;
    }
  }, [amount, estimateId, locationId, isAmountValid, stripeConfigured]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isProcessing || isCreatingIntent) {
      return;
    }

    if (!stripe || !elements) {
      setError("Payment system not ready. Please wait...");
      return;
    }

    try {
      setIsProcessing(true);

      if (!clientSecret) {
        const newClientSecret = await createPaymentIntent();
        if (!newClientSecret) {
          return;
        }
        return;
      }

      let paymentIntentAlreadySucceeded = false;
      if (clientSecret && paymentIntentId) {
        try {
          const nonce = await getWpNonceSafe().catch(() => "");
          const statusResponse = await fetch("/api/stripe/check-payment-intent-status", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-WP-Nonce": nonce || "" },
            credentials: "include",
            body: JSON.stringify({ paymentIntentId }),
          });

          if (!statusResponse.ok) {
            let errorData = null;
            try {
              errorData = await statusResponse.json();
            } catch (e) {
              // Response is not JSON, ignore
            }

            if (statusResponse.status === 404) {
              if (process.env.NODE_ENV === "development") {
                console.warn("PaymentIntent not found, clearing state", { paymentIntentId });
              }
              setClientSecret(null);
              setPaymentIntentId(null);
              setCardElementReady(false);
              setError("Payment session expired. Please create a new payment.");
              setIsProcessing(false);
              return;
            }

            if (process.env.NODE_ENV === "development") {
              console.warn("Status check HTTP error, proceeding with confirmation", {
                status: statusResponse.status,
                error: errorData,
              });
            }
          } else {
            const statusData = await statusResponse.json();

            if (statusData.ok && statusData.status === "succeeded") {
              paymentIntentAlreadySucceeded = true;
              if (process.env.NODE_ENV === "development") {
                console.info("PaymentIntent already succeeded in Stripe, proceeding with backend confirmation", {
                  paymentIntentId,
                  estimateId,
                });
              }
              toast.info("Stripe payment succeeded. Finalising in portal...", {
                description: "Completing payment confirmation...",
                duration: 2500,
              });
            }

            if (statusData.ok && statusData.status === "canceled") {
              setClientSecret(null);
              setPaymentIntentId(null);
              setCardElementReady(false);

              setError("This payment was canceled. Please create a new payment.");
              setIsProcessing(false);
              return;
            }

            if (!statusData.ok) {
              if (process.env.NODE_ENV === "development") {
                console.warn("Status check returned error, proceeding with confirmation", statusData);
              }
            }
          }
        } catch (statusError) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to check PaymentIntent status, proceeding with confirmation", statusError);
          }
        }
      }

      let stripeError = null;
      let paymentIntent = null;

      if (paymentIntentAlreadySucceeded) {
        paymentIntent = {
          id: paymentIntentId,
          status: "succeeded",
        };
      } else {
        if (!cardElementReady) {
          setError("Card element not ready. Please wait a moment and try again.");
          return;
        }

        const card = elements.getElement(CardElement);
        if (!card) {
          setError("Card element not ready. Please wait a moment and try again.");
          return;
        }

        const stripeResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
          },
        });
        stripeError = stripeResult.error;
        paymentIntent = stripeResult.paymentIntent;
      }

      if (stripeError) {
        if (
          stripeError.code === "payment_intent_unexpected_state" ||
          stripeError.message?.toLowerCase().includes("already succeeded")
        ) {
          if (process.env.NODE_ENV === "development") {
            console.info("PaymentIntent already succeeded (from Stripe error), proceeding with backend confirmation", {
              paymentIntentId,
              error: stripeError.message,
              estimateId,
            });
          }
          paymentIntent = {
            id: paymentIntentId,
            status: "succeeded",
          };
          stripeError = null;
          toast.info("Stripe payment succeeded. Finalising in portal...", {
            description: "Completing payment confirmation...",
            duration: 2500,
          });
        }

        if (stripeError) {
          let errorMessage = "Payment failed";
          if (stripeError.code === "card_declined") {
            errorMessage = "Your card was declined. Please try a different payment method.";
          } else if (stripeError.code === "insufficient_funds") {
            errorMessage = "Insufficient funds. Please use a different card or contact your bank.";
          } else if (stripeError.code === "expired_card") {
            errorMessage = "Your card has expired. Please use a different card.";
          } else if (stripeError.code === "incorrect_cvc") {
            errorMessage = "Your card's security code is incorrect. Please check and try again.";
          } else if (stripeError.code === "incorrect_number") {
            errorMessage = "Your card number is incorrect. Please check and try again.";
          } else if (stripeError.code === "processing_error") {
            errorMessage = "An error occurred while processing your card. Please try again.";
          } else if (stripeError.code === "authentication_required") {
            errorMessage = "Your card requires authentication. Please complete the verification.";
          } else if (stripeError.message) {
            errorMessage = stripeError.message;
          }

          throw new Error(errorMessage);
        }
      }

      if (!paymentIntent) {
        throw new Error("Payment confirmation failed. Please try again.");
      }

      if (paymentIntent.status === "requires_action") {
        if (paymentIntent.next_action) {
          toast.info("Authentication required", {
            description: "Please complete the verification on your card.",
            duration: 5000,
          });

          const { error: actionError, paymentIntent: updatedIntent } = await stripe.handleCardAction(clientSecret);

          if (actionError) {
            throw new Error(actionError.message || "Authentication failed. Please try again.");
          }

          if (updatedIntent.status === "succeeded") {
            toast.success("Authentication complete", {
              description: "Payment confirmed successfully.",
              duration: 3000,
            });
          } else if (updatedIntent.status === "processing") {
            toast.info("Payment processing", {
              description: "Authentication complete. Processing payment...",
              duration: 5000,
            });
          } else if (updatedIntent.status === "requires_action") {
            throw new Error("Authentication incomplete. Please try again.");
          } else {
            throw new Error(`Unexpected status after authentication: ${updatedIntent.status}. Please try again.`);
          }

          paymentIntent = updatedIntent;
        } else {
          throw new Error("Authentication required but no action available. Please try again.");
        }
      }

      const isProcessingStatus = paymentIntent.status === "processing";
      if (isProcessingStatus) {
        toast.info("Payment processing", {
          description: "Your payment is being processed. Final confirmation will arrive shortly via webhook.",
          duration: 6000,
        });
      }

      if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
        throw new Error(`Payment status: ${paymentIntent.status}. Payment was not successful.`);
      }

      const verifyResponse = await fetch("/api/stripe/confirm-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          estimateId,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.ok) {
        const statusCode = verifyResponse.status;
        const errorCode = verifyData.error?.code || verifyData.err?.code;

        if (statusCode === 202 || errorCode === "payment_processing") {
          toast.info("Payment processing", {
            description: "Your payment is being processed. You will receive confirmation shortly.",
            duration: 5000,
          });
        } else if (statusCode === 402 || errorCode === "payment_requires_action") {
          throw new Error("Payment requires authentication. Please complete the verification and try again.");
        } else {
          throw new Error(
            verifyData.error?.message ||
              verifyData.err?.message ||
              verifyData.error ||
              verifyData.err ||
              "Payment verification failed"
          );
        }
      }

      const nonce = await getWpNonceSafe({ inviteToken, estimateId }).catch((err) => {
        const msg =
          err?.code === "AUTH_REQUIRED"
            ? "Session expired. Please log in again."
            : (err?.message || "Failed to confirm payment.");
        setError(msg);
        toast.error("Payment failed", { description: msg });
        return null;
      });
      if (!nonce) {
        setIsProcessing(false);
        return;
      }

      const confirmResponse = await fetch("/api/portal/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WP-Nonce": nonce || "" },
        credentials: "include",
        body: JSON.stringify({
          estimateId,
          locationId,
          inviteToken,
          amount,
          provider: "stripe",
          transactionId: paymentIntent.id,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmData.ok) {
        const errorCode = confirmData.code || confirmData.error?.code || confirmData.err?.code;
        const isAlreadyPaid = errorCode === "invoice_already_paid";
        const isIdempotentSuccess =
          confirmData.alreadyPaid === true || confirmData.duplicateTransaction === true;

        if (isAlreadyPaid && isIdempotentSuccess) {
          console.info("[PAYMENT_CONFIRM] Payment already processed (idempotent success)", {
            estimateId,
            transactionId: paymentIntent.id,
            backendResponse: confirmData,
          });

          setClientSecret(null);
          setPaymentIntentId(null);
          setCardElementReady(false);

          toast.success("Payment confirmed", {
            description: "Your payment has already been processed.",
            duration: 2000,
          });

          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }

        throw new Error(confirmData.error || confirmData.err || "Failed to confirm payment");
      }

      setClientSecret(null);
      setPaymentIntentId(null);
      setCardElementReady(false);

      toast.success("Payment processed!", {
        description: `Your payment of $${amount.toLocaleString("en-AU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} has been confirmed.`,
        duration: 2000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || "Failed to process payment. Please try again.";
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes("expired")) {
        setClientSecret(null);
        setPaymentIntentId(null);
      }
      toast.error("Payment failed", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5" noValidate>
      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error-bg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-error flex items-center gap-2">
            <span className="text-error">⚠</span>
            {error}
          </p>
        </div>
      )}

      <div className="mb-4 rounded-xl border border-border bg-muted p-4">
        <label className="text-sm font-medium text-foreground mb-2 block">Card Details</label>
        {clientSecret ? (
          <>
            <div className="p-3 rounded-lg border border-border bg-background">
              <CardElement
                options={cardElementOptions}
                onReady={() => {
                  const element = elements.getElement(CardElement);
                  if (element) {
                    cardElementRef.current = element;
                  }
                  setCardElementReady(true);
                }}
                onChange={(e) => {
                  if (e.element) {
                    cardElementRef.current = e.element;
                  }
                  if (e.complete && !cardElementReady) {
                    setCardElementReady(true);
                  }
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Test card: 4242 4242 4242 4242 | Any future date | Any CVC
            </p>
          </>
        ) : (
          <div className="p-3 rounded-lg border border-border bg-background/50">
            <p className="text-sm text-muted-foreground">Card details will appear after you click "Pay"</p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          isProcessing ||
          isCreatingIntent ||
          !isAmountValid ||
          amount === null ||
          !stripe ||
          !elements ||
          (clientSecret && !cardElementReady)
        }
        size="lg"
        className="w-full bg-gradient-to-r from-primary via-primary to-secondary text-white font-bold py-6 rounded-xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none relative overflow-hidden group"
      >
        {isProcessing || isCreatingIntent ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Spinner size="sm" className="mr-2" />
            {isProcessing ? "Processing..." : "Initializing..."}
          </span>
        ) : (
          <>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {clientSecret ? "Complete Payment" : "Pay Now"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </>
        )}
      </Button>
    </form>
  );
}

PaymentFormInner.displayName = "PaymentFormInner";

export { PaymentFormInner };
