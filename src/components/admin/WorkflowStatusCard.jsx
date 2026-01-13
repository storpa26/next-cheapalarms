import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  CreditCard,
  ChevronDown,
  ChevronUp
} from "lucide-react";

/**
 * WorkflowStatusCard Component
 * 
 * Displays customer journey/workflow status, booking, and payment information
 * for admins to track customer progress through the portal workflow.
 */
export function WorkflowStatusCard({ workflow, booking, payment }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Valid workflow statuses
  const VALID_STATUSES = ['requested', 'reviewing', 'reviewed', 'accepted', 'booked', 'paid', 'completed'];

  // If no workflow data or invalid structure, don't render
  if (!workflow || typeof workflow !== 'object' || typeof workflow.status !== 'string' || workflow.status === '') {
    return null;
  }

  // Validate workflow status
  const { status, currentStep, requestedAt, reviewedAt, acceptedAt, bookedAt, paidAt, completedAt } = workflow;
  
  if (!VALID_STATUSES.includes(status)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Invalid workflow status:', status);
    }
    return null;
  }

  // Map workflow status to display label and color
  const getStatusInfo = (status) => {
    const statusMap = {
      requested: { label: "Requested", color: "bg-muted text-muted-foreground border-border" },
      reviewing: { label: "Reviewing", color: "bg-info-bg text-info border-info/30" },
      reviewed: { label: "Reviewed", color: "bg-success-bg text-success border-success/30" },
      accepted: { label: "Accepted", color: "bg-success-bg text-success border-success/30" },
      booked: { label: "Booked", color: "bg-secondary/10 text-secondary border-secondary/30" },
      paid: { label: "Paid", color: "bg-warning-bg text-warning border-warning/30" },
      completed: { label: "Completed", color: "bg-success-bg text-success border-success/30" },
    };
    return statusMap[status] || { label: status, color: "bg-muted text-muted-foreground border-border" };
  };

  const statusInfo = getStatusInfo(status);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Invalid date, return raw value
      }
      return date.toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format booking date safely
  const formatBookingDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Invalid date, return raw value
      }
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get payment status label
  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      'paid': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || (status ? 'Unknown' : 'Pending');
  };

  // Format payment amount safely
  const formatPaymentAmount = (amount) => {
    if (amount === null || amount === undefined) return null;
    const num = Number(amount);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      return '$0.00';
    }
    return `$${num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Escape HTML to prevent XSS (works in both client and server)
  const escapeHtml = (text) => {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Workflow steps (4 external steps mapped from 5 internal states)
  // FIX: Payment first, booking later (new workflow order)
  const getExternalStep = (workflowStatus) => {
    switch (workflowStatus) {
      case 'requested': return 1;
      case 'reviewing': case 'reviewed': case 'accepted': return 2;
      case 'paid': case 'completed': return 3;  // Payment is step 3 (payment first)
      case 'booked': return 4;                  // Booking is step 4 (booking later)
      default: return 1;
    }
  };

  const externalStep = getExternalStep(status);
  const steps = [
    { label: 'Request', step: 1, completed: externalStep >= 1 },
    { label: 'Review', step: 2, completed: externalStep >= 2 },
    { label: 'Payment', step: 3, completed: externalStep >= 3 },   // Payment is step 3 (payment first)
    { label: 'Book', step: 4, completed: externalStep >= 4 },      // Booking is step 4 (booking later)
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Customer Journey</h3>
          <Badge className={`text-xs ${statusInfo.color} border`}>
            {statusInfo.label}
          </Badge>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Workflow Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Progress</span>
              <span className="text-xs text-muted-foreground">Step {externalStep} of 4</span>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div key={step.step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.completed 
                        ? 'bg-success border-success text-success-foreground' 
                        : externalStep === step.step
                        ? 'bg-primary border-primary text-primary-foreground animate-pulse'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      step.completed ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-1.5 text-xs">
            {requestedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested:</span>
                <span className="text-foreground font-medium">{formatDate(requestedAt)}</span>
              </div>
            )}
            {reviewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed:</span>
                <span className="text-foreground font-medium">{formatDate(reviewedAt)}</span>
              </div>
            )}
            {acceptedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accepted:</span>
                <span className="text-foreground font-medium">{formatDate(acceptedAt)}</span>
              </div>
            )}
            {bookedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booked:</span>
                <span className="text-foreground font-medium">{formatDate(bookedAt)}</span>
              </div>
            )}
            {paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid:</span>
                <span className="text-foreground font-medium">{formatDate(paidAt)}</span>
              </div>
            )}
            {completedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="text-foreground font-medium">{formatDate(completedAt)}</span>
              </div>
            )}
          </div>

          {/* Booking Information */}
          {booking && booking !== null && booking?.scheduledDate && (
            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Booking</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground font-medium">
                    {formatBookingDate(booking?.scheduledDate)}
                  </span>
                </div>
                {booking?.scheduledTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="text-foreground font-medium">{escapeHtml(booking?.scheduledTime)}</span>
                  </div>
                )}
                {booking?.notes && (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="text-foreground mt-1 whitespace-pre-wrap">{escapeHtml(booking?.notes)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {payment && payment !== null && typeof payment === 'object' && (
            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Payment</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={payment?.status === 'paid' ? 'bg-success-bg text-success border-success/30' : 'bg-muted text-muted-foreground border-border'}>
                    {getPaymentStatusLabel(payment?.status)}
                  </Badge>
                </div>
                {(() => {
                  const formattedAmount = formatPaymentAmount(payment?.amount);
                  return formattedAmount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="text-foreground font-medium">
                        {formattedAmount}
                      </span>
                    </div>
                  );
                })()}
                {payment?.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="text-foreground font-medium">{formatDate(payment?.paidAt)}</span>
                  </div>
                )}
                {payment?.provider && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="text-foreground font-medium capitalize">{escapeHtml(payment?.provider)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

