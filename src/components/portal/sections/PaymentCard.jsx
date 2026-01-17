import { useState, useEffect, useCallback } from "react";
import { CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";
import { Spinner } from "../../ui/spinner";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getWpNonceSafe } from "../../../lib/api/get-wp-nonce";

// Initialize Stripe (publishable key from backend config)
// We'll get this from an API endpoint or environment variable
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

/**
 * Payment Form Component (inside Stripe Elements)
 */
function PaymentForm({ estimateId, locationId, inviteToken, amount, onSuccess, workflow }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [stripeReady, setStripeReady] = useState(!!stripePromise);

  useEffect(() => {
    setStripeReady(!!stripePromise);
  }, []);

  // Guard: Only initialize if workflow is at payment step
  const shouldInitialize = workflow?.status === 'accepted' || workflow?.status === 'booked';

  // Create payment intent when component mounts - ONLY if workflow is at payment step
  useEffect(() => {
    // Don't initialize if not at payment step
    if (!shouldInitialize) return;
    
    // Don't recreate if already created, or if amount is invalid
    if (!amount || amount <= 0 || clientSecret) return;
    
    if (!stripePromise) {
      setError('Stripe is not configured. Missing publishable key.');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const nonce = await getWpNonceSafe().catch(() => '');
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce || '' },
          credentials: 'include',
          body: JSON.stringify({
            amount,
            currency: 'aud',
            estimateId, // SECURITY: Required for server-side amount validation
            metadata: {
              estimateId,
              locationId,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || data.err || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        setError(err.message || 'Failed to initialize payment');
        toast.error('Payment initialization failed', {
          description: err.message,
        });
      }
    };

    createPaymentIntent();
  }, [shouldInitialize, amount, estimateId, locationId, clientSecret, workflow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please wait...');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError('Card element not ready. Please wait...');
        setIsProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      // Verify payment intent on backend
      const verifyResponse = await fetch('/api/stripe/confirm-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          estimateId, // SECURITY: Required for server-side validation
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.ok) {
        throw new Error(verifyData.error || verifyData.err || 'Payment verification failed');
      }

      // Get nonce for CSRF protection (payment confirmation)
      const nonce = await getWpNonceSafe({ inviteToken, estimateId }).catch((err) => {
        const msg = err?.code === 'AUTH_REQUIRED'
          ? 'Session expired. Please log in again.'
          : (err?.message || 'Failed to confirm payment.');
        setError(msg);
        toast.error('Payment failed', { description: msg });
        return null;
      });
      if (!nonce) {
        setIsProcessing(false);
        return;
      }

      // Confirm payment in our system
      const confirmResponse = await fetch('/api/portal/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce || '' },
        credentials: 'include',
        body: JSON.stringify({
          estimateId,
          locationId,
          inviteToken,
          amount,
          provider: 'stripe',
          transactionId: paymentIntent.id,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmData.ok) {
        throw new Error(confirmData.error || confirmData.err || 'Failed to confirm payment');
      }

      // Success!
      toast.success('Payment processed!', {
        description: `Your payment of $${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been confirmed.`,
        duration: 3000,
      });

      onSuccess();
    } catch (err) {
      const errorMessage = err.message || 'Failed to process payment. Please try again.';
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes('expired')) {
        setClientSecret(null);
        setPaymentIntentId(null);
      }
      toast.error('Payment failed', {
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
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
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

      {!clientSecret ? (
        <div className="mb-4 rounded-xl border border-border bg-muted p-4">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <p className="text-sm text-muted-foreground">Initializing payment...</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border bg-muted p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Card Details
          </label>
          <div className="p-3 rounded-lg border border-border bg-background">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Test card: 4242 4242 4242 4242 | Any future date | Any CVC
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !clientSecret || amount === null}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isProcessing ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          <>
            Complete Payment <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * PaymentCard Component
 * 
 * Allows customers to complete payment after estimate acceptance.
 * NEW WORKFLOW: Payment comes BEFORE booking.
 * Shown when:
 * - workflow.status === "accepted" AND invoice exists (not yet paid)
 * - workflow.status === "booked" AND not yet fully paid (partial payment scenario)
 */
export function PaymentCard({ estimateId, locationId, inviteToken, payment, workflow, invoice }) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS (React Rules of Hooks)
  const router = useRouter();
  const [shouldReload, setShouldReload] = useState(false);
  const paymentsList = Array.isArray(payment?.payments) ? payment.payments : [];

  // Calculate invoice total (from invoice or fallback) - moved before early returns
  const getInvoiceTotal = () => {
    if (invoice) {
      // Check for new nested structure first
      if (invoice.ghl && invoice.ghl.total) {
        return parseFloat(invoice.ghl.total);
      }
      // Fallback to old flat structure
      if (invoice.total) {
        return parseFloat(invoice.total);
      }
    }
    // Fallback: try to get from payment data if exists
    if (payment && payment.amount) {
      return parseFloat(payment.amount);
    }
    return null;
  };

  const invoiceTotal = getInvoiceTotal();
  const remainingBalance =
    payment && typeof payment.remainingBalance === 'number'
      ? payment.remainingBalance
      : invoiceTotal !== null && payment?.amount
        ? Math.max(0, invoiceTotal - Number(payment.amount))
        : null;

  // If partial, charge only the remaining balance
  const payableAmount =
    payment?.status === 'partial' && remainingBalance !== null ? remainingBalance : invoiceTotal;

  const formatAmount = (amt) => {
    if (amt === null || amt === undefined) return '—';
    const num = Number(amt);
    if (isNaN(num) || !isFinite(num)) return '—';
    return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePaymentSuccess = useCallback(() => {
    // Reload page after a short delay to show updated payment status
    setTimeout(() => {
      router.reload();
    }, 1500);
  }, [router]);

  // Reload if needed
  useEffect(() => {
    if (shouldReload) {
      router.reload();
    }
  }, [shouldReload, router]);

  // If already paid, show confirmation
  if (payment && payment.status === 'paid') {
    const formatAmount = (amount) => {
      if (amount === null || amount === undefined) return '$0.00';
      const num = Number(amount);
      if (isNaN(num) || !isFinite(num)) return '$0.00';
      return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Payment</p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">Payment Confirmed</h3>
            <p className="text-sm text-muted-foreground">Your payment has been processed</p>
          </div>
          <div className="rounded-full bg-success-bg p-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-success/30 bg-success-bg p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-success">Amount Paid</span>
              <span className="text-2xl font-semibold text-success">
                {formatAmount(payment.amount)}
              </span>
            </div>
            {payment.paidAt && (
              <p className="text-xs text-success">
                Paid on {new Date(payment.paidAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {payment.provider && (
              <p className="text-xs text-success">
                Payment method: {payment.provider === 'stripe' ? 'Stripe' : payment.provider}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show payment form if:
  // 1. Accepted and invoice exists (new workflow: payment before booking)
  // 2. Booked but not fully paid (partial payment scenario)
  const isAccepted = workflow?.status === 'accepted';
  const isBooked = workflow?.status === 'booked';
  const hasInvoice = invoice && (invoice.id || invoice.number);
  const isFullyPaid = payment && payment.status === 'paid';
  
  if (!isAccepted && !isBooked) {
    return null; // Only show when accepted (with invoice) or booked (partial payment)
  }
  
  if (isAccepted && !hasInvoice) {
    return null; // Don't show payment form if no invoice yet
  }
  
  if (isBooked && isFullyPaid) {
    return null; // Don't show payment form if fully paid
  }

  if (!stripePromise) {
    return (
      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        <h3 className="text-xl font-semibold text-foreground">Payments unavailable</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Stripe is not configured. Please contact support or try again later.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Payment</p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">
              {payment?.status === 'partial' ? 'Complete Remaining Balance' : 'Complete Payment'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {payment?.status === 'partial'
                ? 'You have a partial payment recorded. Please pay the remaining balance.'
                : 'Finalize your estimate payment'}
            </p>
          </div>
          <div className="rounded-full bg-secondary/15 p-4">
            <CreditCard className="h-6 w-6 text-secondary" />
          </div>
        </div>

        {payment?.status === 'partial' && (
          <div className="mt-4 rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm text-foreground">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total invoice</span>
                <span className="font-semibold">{formatAmount(invoiceTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid so far</span>
                <span className="font-semibold text-success">{formatAmount(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining balance</span>
                <span className="font-semibold text-warning">{formatAmount(remainingBalance)}</span>
              </div>
            </div>
          </div>
        )}

        {paymentsList.length > 0 && (
          <div className="mt-4 rounded-xl border border-border/60 bg-muted p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">Payment history</p>
            <div className="space-y-2 text-sm">
              {paymentsList.map((pmt, idx) => (
                <div key={`${pmt.transactionId || 'payment'}-${idx}`} className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatAmount(pmt.amount)}</span>
                    {pmt.paidAt && (
                      <span className="text-muted-foreground text-xs">
                        {new Date(pmt.paidAt).toLocaleString('en-AU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-muted-foreground text-xs">
                    <div>{pmt.provider ? pmt.provider : 'Payment'}</div>
                    {pmt.transactionId && <div className="truncate max-w-[140px]">{pmt.transactionId}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Total Amount</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatAmount(payableAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Payment Method</p>
            <p className="mt-2 text-lg font-semibold text-foreground">Credit Card</p>
            <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
          </div>
        </div>

        <PaymentForm
          estimateId={estimateId}
          locationId={locationId}
          inviteToken={inviteToken}
          amount={payableAmount}
          workflow={workflow}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </Elements>
  );
}
