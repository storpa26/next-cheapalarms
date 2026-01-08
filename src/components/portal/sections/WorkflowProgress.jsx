import { CheckCircle2, Circle } from "lucide-react";

/**
 * WorkflowProgress Component
 * 
 * Displays a 4-step progress bar for the customer workflow:
 * 1. Request
 * 2. Review (includes reviewing states, but NOT accepted)
 * 3. Payment (after acceptance, before booking)
 * 4. Book (after payment)
 * 
 * NEW WORKFLOW ORDER: Payment comes BEFORE booking
 */
export function WorkflowProgress({ workflow }) {
  // If no workflow data, don't render
  if (!workflow || typeof workflow !== 'object' || typeof workflow.status !== 'string' || workflow.status === '') {
    return null;
  }

  const { status } = workflow;

  // Map internal workflow status to external step (4 steps total)
  // NEW: accepted maps to step 3 (Payment), not step 2
  const getExternalStep = (workflowStatus) => {
    switch (workflowStatus) {
      case 'requested': return 1;
      // Review states (before acceptance) map to step 2
      case 'sent': case 'ready_to_accept': case 'under_review': case 'reviewing': case 'reviewed': return 2;
      // Rejected estimates (rejected after being sent) should show step 2
      // This prevents hydration mismatch: server might render 'sent' (step 2), client renders 'rejected' (should also be step 2)
      case 'rejected': return 2;
      // Accepted estimates move to step 3 (Payment) - payment comes before booking
      case 'accepted': return 3;
      // Booked (after payment) maps to step 4
      case 'booked': return 4;
      // Paid/completed maps to step 4 (final step)
      case 'paid': case 'completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getExternalStep(status);
  
  const steps = [
    { label: 'Request', step: 1 },
    { label: 'Review', step: 2 },
    { label: 'Payment', step: 3 }, // Payment comes before booking
    { label: 'Book', step: 4 }, // Booking happens after payment
  ];

  // Calculate progress percentage (ensure it's between 5% and 100%)
  const progressPercentage = Math.max(5, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm animate-in fade-in duration-300">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-1">Your Progress</p>
        <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-4">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.step;
          const isCurrent = currentStep === step.step;
          
          return (
            <div key={step.step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-success border-success text-success-foreground scale-110 shadow-lg shadow-success/50'
                    : isCurrent
                    ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50 animate-pulse'
                    : 'bg-muted border-border-subtle text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-success' : 'bg-border-subtle'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

