import { useState } from "react";
import { Calendar, Clock, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { toast } from "sonner";

/**
 * BookingCard Component
 * 
 * Allows customers to book installation date/time after accepting an estimate.
 * Shown when workflow.status === "accepted" and not yet booked.
 */
export function BookingCard({ estimateId, locationId, inviteToken, booking, workflow }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  // If already booked, show confirmation
  if (booking && booking.status === 'scheduled') {
    const formatBookingDate = (dateString) => {
      if (!dateString) return 'Not set';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-AU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Installation Booking</p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">Booking Confirmed</h3>
            <p className="text-sm text-muted-foreground">Your installation has been scheduled</p>
          </div>
          <div className="rounded-full bg-success-bg p-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 uppercase tracking-wide">Date</p>
                <p className="text-sm font-semibold text-emerald-900">
                  {formatBookingDate(booking.scheduledDate || booking.scheduledDateTime)}
                </p>
              </div>
            </div>
            {booking.scheduledTime && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wide">Time</p>
                  <p className="text-sm font-semibold text-emerald-900">{booking.scheduledTime}</p>
                </div>
              </div>
            )}
            {booking.notes && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-emerald-900">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show booking form if accepted but not booked
  if (workflow?.status !== 'accepted') {
    return null; // Only show when accepted
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/portal/book-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId,
          locationId,
          inviteToken,
          date,
          time,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || data.err || 'Failed to book installation');
      }

      // Show success toast
      toast.success('Booking confirmed!', {
        description: 'Your installation has been scheduled successfully.',
        duration: 3000,
      });

      // Refresh the page after a short delay to show the toast
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Failed to book installation. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
      toast.error('Booking failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Installation Booking</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Schedule Installation</h3>
          <p className="text-sm text-slate-500">Choose your preferred date and time</p>
        </div>
        <div className="rounded-full bg-primary/15 p-4">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preferred Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              disabled={isSubmitting}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preferred Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={isSubmitting}
              className="rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Additional Notes (Optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions or access details..."
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <span className="text-red-600">⚠</span>
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !date || !time}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Booking...
            </>
          ) : (
            <>
              Confirm Booking <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

