import { useState } from "react";
import { CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { toast } from "sonner";

/**
 * PaymentCard Component
 * 
 * Allows customers to complete payment after booking.
 * Shown when workflow.status === "booked" and not yet paid.
 */
export function PaymentCard({ estimateId, locationId, inviteToken, payment, workflow, invoice }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
          </div>
        </div>
      </div>
    );
  }

  // Show payment form if booked but not paid
  if (workflow?.status !== 'booked') {
    return null; // Only show when booked
  }

  // Calculate payment amount (from invoice or fallback)
  const getPaymentAmount = () => {
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

  const amount = getPaymentAmount();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/portal/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId,
          locationId,
          inviteToken,
          amount: amount || undefined,
          provider: 'mock', // Mock payment for v1
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.err || 'Failed to process payment');
      }

      // Show success toast
      toast.success('Payment processed!', {
        description: `Your payment of ${formatAmount(amount)} has been confirmed.`,
        duration: 3000,
      });

      // Refresh the page after a short delay to show the toast
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Failed to process payment. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
      toast.error('Payment failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  const formatAmount = (amt) => {
    if (amt === null || amt === undefined) return '—';
    const num = Number(amt);
    if (isNaN(num) || !isFinite(num)) return '—';
    return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Payment</p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">Complete Payment</h3>
          <p className="text-sm text-muted-foreground">Finalize your estimate payment</p>
        </div>
        <div className="rounded-full bg-secondary/15 p-4">
          <CreditCard className="h-6 w-6 text-secondary" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Total Amount</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {formatAmount(amount)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Payment Method</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Mock Payment</p>
          <p className="text-xs text-muted-foreground">For testing purposes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5" noValidate>
        {error && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error-bg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-error flex items-center gap-2">
              <span className="text-error">⚠</span>
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || amount === null}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
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
    </div>
  );
}

