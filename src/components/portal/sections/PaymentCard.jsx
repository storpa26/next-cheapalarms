import { useState, useEffect, useCallback, useMemo } from "react";
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
function PaymentForm({ estimateId, locationId, inviteToken, amount, onSuccess, workflow, isAmountValid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [stripeReady, setStripeReady] = useState(!!stripePromise);

  useEffect(() => {
    setStripeReady(!!stripePromise);
  }, []);

  // Guard: Only initialize if workflow is at payment step
  const shouldInitialize = workflow?.status === 'accepted' || workflow?.status === 'booked';

  // Create payment intent function (called on form submit, not on mount)
  const createPaymentIntent = useCallback(async () => {
    if (!amount || amount <= 0 || !isAmountValid) {
      setError('Please enter a valid payment amount');
      return null;
    }
    
    if (!stripePromise) {
      setError('Stripe is not configured. Missing publishable key.');
      return null;
    }

    setIsCreatingIntent(true);
    setError(null);

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
      setIsCreatingIntent(false);
      return data.clientSecret;
      } catch (err) {
      setError(err.message || 'Failed to create payment intent');
      setIsCreatingIntent(false);
        toast.error('Payment initialization failed', {
          description: err.message,
        });
      return null;
      }
  }, [amount, estimateId, locationId, isAmountValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Create payment intent if not already created
    let secretToUse = clientSecret;
    if (!secretToUse) {
      secretToUse = await createPaymentIntent();
      if (!secretToUse) {
        return; // Error already set in createPaymentIntent
      }
    }

    if (!stripe || !elements || !secretToUse) {
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
        secretToUse,
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

        <div className="mb-4 rounded-xl border border-border bg-muted p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Card Details
          </label>
        {clientSecret ? (
          <>
          <div className="p-3 rounded-lg border border-border bg-background">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Test card: 4242 4242 4242 4242 | Any future date | Any CVC
          </p>
          </>
        ) : (
          <div className="p-3 rounded-lg border border-border bg-background/50">
            <p className="text-sm text-muted-foreground">
              Card details will appear after you click "Pay"
          </p>
        </div>
      )}
      </div>

      <Button
        type="submit"
        disabled={isProcessing || isCreatingIntent || !isAmountValid || amount === null}
        size="lg"
        className="w-full bg-gradient-to-r from-primary via-primary to-secondary text-white font-bold py-6 rounded-xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none relative overflow-hidden group"
      >
        {isProcessing || isCreatingIntent ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Spinner size="sm" className="mr-2" />
            {isProcessing ? 'Processing...' : 'Initializing...'}
          </span>
        ) : (
          <>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {clientSecret ? 'Complete Payment' : 'Pay Now'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Helper function to format amounts (moved outside component to prevent recreation on every render)
 */
function formatAmount(amt) {
  if (amt === null || amt === undefined) return '—';
  const num = Number(amt);
  if (isNaN(num) || !isFinite(num)) return '—';
  return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
export function PaymentCard({ estimateId, locationId, inviteToken, payment, workflow, invoice, minimumPaymentInfo }) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS (React Rules of Hooks)
  const router = useRouter();
  const [shouldReload, setShouldReload] = useState(false);
  const [customAmount, setCustomAmount] = useState(null);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null); // '25', '50', '75', 'minimum', 'full', or null
  const paymentsList = Array.isArray(payment?.payments) ? payment.payments : [];

  // Calculate invoice total (memoized for performance)
  const invoiceTotal = useMemo(() => {
    // Prefer minimumPaymentInfo (source of truth from backend)
    if (minimumPaymentInfo?.invoiceTotal) {
      return parseFloat(minimumPaymentInfo.invoiceTotal);
    }
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
    if (payment && payment.invoiceTotal) {
      return parseFloat(payment.invoiceTotal);
    }
    return null;
  }, [minimumPaymentInfo?.invoiceTotal, invoice, payment]);
  
  // Get remaining balance from minimumPaymentInfo (source of truth) or calculate (memoized)
  const remainingBalance = useMemo(() => {
    if (minimumPaymentInfo?.remainingBalance !== undefined) {
      return parseFloat(minimumPaymentInfo.remainingBalance);
    }
    if (payment && typeof payment.remainingBalance === 'number') {
      return payment.remainingBalance;
    }
    // FIX: Calculate even when payment.amount doesn't exist (first payment scenario)
    // If invoiceTotal is valid, remaining balance = invoiceTotal - existing paid amount
    if (invoiceTotal !== null) {
      const existingPaid = payment?.amount ? Number(payment.amount) : 0;
      return Math.max(0, invoiceTotal - existingPaid);
    }
    return null;
  }, [minimumPaymentInfo?.remainingBalance, payment, invoiceTotal]);

  // Get minimum payment from minimumPaymentInfo or calculate fallback (memoized)
  const minimumPayment = useMemo(() => {
    if (minimumPaymentInfo?.minimumPayment !== undefined) {
      return parseFloat(minimumPaymentInfo.minimumPayment);
    }
    return null;
  }, [minimumPaymentInfo?.minimumPayment]);

  // Calculate existing paid amount (memoized)
  const existingPaidAmount = useMemo(() => {
    if (minimumPaymentInfo?.existingPaidAmount !== undefined) {
      return parseFloat(minimumPaymentInfo.existingPaidAmount);
    }
    return payment?.amount ? parseFloat(payment.amount) : 0;
  }, [minimumPaymentInfo?.existingPaidAmount, payment?.amount]);

  // Calculate default payable amount that respects minimum requirement (memoized)
  const defaultPayableAmount = useMemo(() => {
    const baseAmount = payment?.status === 'partial' && remainingBalance !== null 
      ? remainingBalance 
      : invoiceTotal;
    
    // Ensure default meets minimum requirement if minimum exists
    let result = baseAmount;
    if (minimumPayment !== null && baseAmount !== null) {
      result = Math.max(baseAmount, minimumPayment);
    }
    
    // Defensive: Never exceed remaining balance (for partial) or invoice total (for first payment)
    if (payment?.status === 'partial' && remainingBalance !== null) {
      result = Math.min(result, remainingBalance);
    } else if (invoiceTotal !== null) {
      result = Math.min(result, invoiceTotal);
    }
    
    return result;
  }, [payment?.status, remainingBalance, invoiceTotal, minimumPayment]);

  // Calculate preset amounts (memoized)
  const preset25 = useMemo(() => remainingBalance !== null ? remainingBalance * 0.25 : null, [remainingBalance]);
  const preset50 = useMemo(() => remainingBalance !== null ? remainingBalance * 0.50 : null, [remainingBalance]);
  const preset75 = useMemo(() => remainingBalance !== null ? remainingBalance * 0.75 : null, [remainingBalance]);

  // Check if preset amounts meet minimum (for button enable/disable) - memoized
  const preset25Valid = useMemo(() => preset25 !== null && minimumPayment !== null && preset25 >= minimumPayment, [preset25, minimumPayment]);
  const preset50Valid = useMemo(() => preset50 !== null && minimumPayment !== null && preset50 >= minimumPayment, [preset50, minimumPayment]);
  const preset75Valid = useMemo(() => preset75 !== null && minimumPayment !== null && preset75 >= minimumPayment, [preset75, minimumPayment]);

  // Auto-select "full" if remaining balance < minimum (only one valid option)
  useEffect(() => {
    if (remainingBalance !== null && minimumPayment !== null && remainingBalance < minimumPayment && remainingBalance > 0) {
      // Only auto-select if no preset is already selected
      if (selectedPreset === null && !useCustomAmount) {
        setSelectedPreset('full');
      }
    }
  }, [remainingBalance, minimumPayment, selectedPreset, useCustomAmount]);

  // When preset is selected, use that amount (memoized)
  const selectedAmount = useMemo(() => {
    if (selectedPreset === '25' && preset25 !== null) return preset25;
    if (selectedPreset === '50' && preset50 !== null) return preset50;
    if (selectedPreset === '75' && preset75 !== null) return preset75;
    if (selectedPreset === 'minimum' && minimumPayment !== null) return minimumPayment;
    if (selectedPreset === 'full' && remainingBalance !== null) return remainingBalance;
    return null;
  }, [selectedPreset, preset25, preset50, preset75, minimumPayment, remainingBalance]);

  // Use custom amount if set, preset amount if selected, otherwise use default (memoized)
  const payableAmount = useMemo(() => {
    if (useCustomAmount && customAmount !== null && customAmount > 0) {
      return customAmount;
    }
    if (selectedAmount !== null) {
      return selectedAmount;
    }
    return defaultPayableAmount;
  }, [useCustomAmount, customAmount, selectedAmount, defaultPayableAmount]);

  // Validate custom amount (including minimum payment check) - memoized
  const customAmountError = useMemo(() => {
    if (!useCustomAmount || customAmount === null) return null;
    
    if (customAmount <= 0) return 'Amount must be greater than zero';
    if (minimumPayment !== null && customAmount < minimumPayment) {
      return `Amount must be at least ${formatAmount(minimumPayment)}`;
    }
    if (remainingBalance !== null && customAmount > remainingBalance) {
      return `Amount cannot exceed remaining balance of ${formatAmount(remainingBalance)}`;
    }
    if (invoiceTotal !== null && customAmount > invoiceTotal) {
      return `Amount cannot exceed invoice total of ${formatAmount(invoiceTotal)}`;
    }
    return null;
  }, [useCustomAmount, customAmount, minimumPayment, remainingBalance, invoiceTotal]);

  // Handle preset button click (memoized with useCallback)
  const handlePresetClick = useCallback((preset) => {
    setSelectedPreset(preset);
    setUseCustomAmount(false);
    setCustomAmount(null);
  }, []);

  // Handle custom amount toggle (memoized with useCallback)
  const handleCustomAmountToggle = useCallback(() => {
    setUseCustomAmount(true);
    setSelectedPreset(null);
    // Pre-fill with remaining balance or minimum, whichever is higher, but never exceed remaining balance
    const prefillAmount = remainingBalance !== null 
      ? Math.min(
          remainingBalance,
          minimumPayment !== null ? Math.max(minimumPayment, remainingBalance * 0.25) : remainingBalance
        )
      : (invoiceTotal !== null 
          ? Math.min(invoiceTotal, minimumPayment !== null ? Math.max(minimumPayment, invoiceTotal * 0.25) : invoiceTotal)
          : null);
    setCustomAmount(prefillAmount);
  }, [remainingBalance, minimumPayment, invoiceTotal]);

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
                Paid on{" "}
                {(() => {
                  // SSR-safe date formatting
                  const date = new Date(payment.paidAt);
                  const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ];
                  const month = months[date.getUTCMonth()];
                  const day = date.getUTCDate();
                  const year = date.getUTCFullYear();
                  return `${day} ${month} ${year}`;
                })()}
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

  // SECURITY: Don't show payment form if invoice total is invalid
  if (invoiceTotal === null || invoiceTotal <= 0) {
    return null; // Invalid invoice total
  }

  // SECURITY: Don't show payment form if no remaining balance
  if (remainingBalance !== null && remainingBalance <= 0) {
    return null; // No remaining balance to pay
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

        {/* Invoice Summary - Gorgeous Modern Design with Glassmorphism */}
        {invoiceTotal !== null && invoiceTotal > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 shadow-xl shadow-black/5 p-6">
            <div className="space-y-4">
              {/* Total Invoice - Prominent */}
              <div className="flex justify-between items-baseline pb-4 border-b-2 border-border/40">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Invoice</span>
                <span className="text-3xl font-black text-foreground tracking-tight">{formatAmount(invoiceTotal)}</span>
              </div>
              
              {/* Paid / Remaining - Clean Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {existingPaidAmount > 0 && (
                  <div className="rounded-xl bg-success/10 p-4 border border-success/20 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Paid so far</p>
                    <p className="text-xl font-bold text-success">{formatAmount(existingPaidAmount)}</p>
                  </div>
                )}
                {remainingBalance !== null && remainingBalance > 0 && (
                  <div className="rounded-xl bg-warning/10 p-4 border border-warning/20 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Remaining</p>
                    <p className="text-xl font-bold text-warning">{formatAmount(remainingBalance)}</p>
                  </div>
                )}
              </div>
              
              {/* Minimum Payment - Highlighted Badge */}
              {minimumPayment !== null && minimumPayment > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 border-2 border-primary/30 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Minimum Payment Required</span>
                    <span className="text-lg font-black text-primary">{formatAmount(minimumPayment)}</span>
                  </div>
                </div>
              )}
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
                        {(() => {
                          // SSR-safe date/time formatting
                          const date = new Date(pmt.paidAt);
                          const months = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          const month = months[date.getUTCMonth()];
                          const day = date.getUTCDate();
                          const year = date.getUTCFullYear();
                          const hours = String(date.getUTCHours()).padStart(2, "0");
                          const minutes = String(date.getUTCMinutes()).padStart(2, "0");
                          return `${day} ${month} ${year}, ${hours}:${minutes}`;
                        })()}
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

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-bold mb-4">Payment Amount</p>
            
            {/* Preset Payment Buttons - Modern Gradient Style */}
            {!useCustomAmount && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Pay Minimum Button - Modern Gradient Glassmorphism Style */}
                  {minimumPayment !== null && minimumPayment > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick('minimum')}
                      aria-label={`Pay minimum amount of ${formatAmount(minimumPayment)}`}
                      aria-pressed={selectedPreset === 'minimum'}
                      className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                        selectedPreset === 'minimum'
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50'
                          : 'bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">Minimum</span>
                        <span className={`text-xs ${selectedPreset === 'minimum' ? 'opacity-90' : 'text-muted-foreground'}`}>{formatAmount(minimumPayment)}</span>
                      </div>
                      {selectedPreset === 'minimum' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      )}
                    </button>
                  )}
                  {preset25Valid && preset25 !== null && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick('25')}
                      aria-label={`Pay 25% which is ${formatAmount(preset25)}`}
                      aria-pressed={selectedPreset === '25'}
                      className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                        selectedPreset === '25'
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50'
                          : 'bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">25%</span>
                        <span className={`text-xs ${selectedPreset === '25' ? 'opacity-90' : 'text-muted-foreground'}`}>{formatAmount(preset25)}</span>
                      </div>
                      {selectedPreset === '25' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      )}
                    </button>
                  )}
                  {preset50Valid && preset50 !== null && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick('50')}
                      aria-label={`Pay 50% which is ${formatAmount(preset50)}`}
                      aria-pressed={selectedPreset === '50'}
                      className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                        selectedPreset === '50'
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50'
                          : 'bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">50%</span>
                        <span className={`text-xs ${selectedPreset === '50' ? 'opacity-90' : 'text-muted-foreground'}`}>{formatAmount(preset50)}</span>
                      </div>
                      {selectedPreset === '50' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      )}
                    </button>
                  )}
                  {preset75Valid && preset75 !== null && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick('75')}
                      aria-label={`Pay 75% which is ${formatAmount(preset75)}`}
                      aria-pressed={selectedPreset === '75'}
                      className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                        selectedPreset === '75'
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50'
                          : 'bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">75%</span>
                        <span className={`text-xs ${selectedPreset === '75' ? 'opacity-90' : 'text-muted-foreground'}`}>{formatAmount(preset75)}</span>
                      </div>
                      {selectedPreset === '75' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      )}
                    </button>
                  )}
                  {remainingBalance !== null && remainingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick('full')}
                      aria-label={`Pay full amount of ${formatAmount(remainingBalance)}`}
                      aria-pressed={selectedPreset === 'full'}
                      className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                        selectedPreset === 'full'
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50'
                          : 'bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">Full</span>
                        <span className={`text-xs ${selectedPreset === 'full' ? 'opacity-90' : 'text-muted-foreground'}`}>{formatAmount(remainingBalance)}</span>
                      </div>
                      {selectedPreset === 'full' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Custom Amount Button - Modern Outline Style */}
                <button
                  type="button"
                  onClick={handleCustomAmountToggle}
                  aria-label="Enter custom payment amount"
                  className="w-full rounded-xl border-2 border-dashed border-border/60 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:shadow-md hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Pay custom amount</span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </div>
                </button>

                {/* Selected Amount Display - Gorgeous Gradient Container */}
                {((selectedPreset || (!useCustomAmount && payableAmount !== null)) && payableAmount !== null && payableAmount > 0) && (
                  <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 ring-1 ring-primary/20 shadow-lg backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                    <div className="relative text-center">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">
                        {selectedPreset ? 'Selected Amount' : 'Amount to Pay'}
                      </p>
                      <p className="text-5xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {formatAmount(payableAmount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Amount Input - Modern Glassmorphism Style */}
            {useCustomAmount && (
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border-2 border-primary/30 shadow-inner backdrop-blur-sm">
                    <span className="text-2xl font-bold text-primary">$</span>
                    <input
                      type="number"
                      id="custom-amount-input"
                      min={minimumPayment !== null ? minimumPayment.toFixed(2) : "0.01"}
                      max={remainingBalance !== null ? remainingBalance : invoiceTotal || undefined}
                      step="0.01"
                      value={customAmount || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCustomAmount(isNaN(val) ? null : val);
                      }}
                      aria-label="Custom payment amount"
                      aria-describedby="custom-amount-help custom-amount-error"
                      aria-invalid={customAmountError !== null}
                      aria-required="true"
                      className="flex-1 text-4xl font-black text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/30"
                      placeholder={minimumPayment !== null ? minimumPayment.toFixed(2) : "0.00"}
                      autoFocus
                    />
                  </div>
                </div>
                
                {customAmountError && (
                  <div className="rounded-xl bg-error/10 border border-error/30 p-3 animate-in fade-in">
                    <p id="custom-amount-error" className="text-xs text-error font-semibold" role="alert">
                      ⚠️ {customAmountError}
                    </p>
                  </div>
                )}
                
                {minimumPayment !== null && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs backdrop-blur-sm">
                    <span className="text-muted-foreground">Minimum: <span className="font-semibold text-foreground">{formatAmount(minimumPayment)}</span></span>
                    <span className="text-muted-foreground">Max: <span className="font-semibold text-foreground">{formatAmount(remainingBalance || invoiceTotal || 0)}</span></span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomAmount(false);
                      setCustomAmount(null);
                      setSelectedPreset(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium underline transition-colors"
                  >
                    ← Use presets
                  </button>
                  {remainingBalance !== null && remainingBalance > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => setCustomAmount(remainingBalance)}
                        className="text-sm text-primary hover:underline font-semibold transition-colors"
                      >
                        Pay full amount ({formatAmount(remainingBalance)})
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border border-white/40 shadow-lg p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-bold mb-4">Payment Method</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-3 ring-1 ring-primary/20 shadow-sm">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Credit Card</p>
                  <p className="text-xs text-muted-foreground">Secure via Stripe</p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border/40">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  🔒 All payments are encrypted. Your card details are never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <PaymentForm
          estimateId={estimateId}
          locationId={locationId}
          inviteToken={inviteToken}
          amount={payableAmount}
          workflow={workflow}
          onSuccess={handlePaymentSuccess}
          isAmountValid={
            !customAmountError && 
            payableAmount !== null && 
            payableAmount > 0 && 
            (minimumPayment === null || payableAmount >= minimumPayment)
          }
        />
      </div>
    </Elements>
  );
}
