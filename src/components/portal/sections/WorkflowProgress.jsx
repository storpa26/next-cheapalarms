import { CheckCircle2, Circle } from "lucide-react";

/**
 * WorkflowProgress Component
 * 
 * Displays a 4-step progress bar for the customer workflow:
 * 1. Request
 * 2. Review (includes reviewing + accepted states)
 * 3. Book
 * 4. Payment
 */
export function WorkflowProgress({ workflow }) {
  // If no workflow data, don't render
  if (!workflow || typeof workflow !== 'object' || typeof workflow.status !== 'string' || workflow.status === '') {
    return null;
  }

  const { status } = workflow;

  // Map internal workflow status to external step (4 steps total)
  const getExternalStep = (workflowStatus) => {
    switch (workflowStatus) {
      case 'requested': return 1;
      case 'reviewing': case 'reviewed': case 'accepted': return 2;
      case 'booked': return 3;
      case 'paid': case 'completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getExternalStep(status);
  
  const steps = [
    { label: 'Request', step: 1 },
    { label: 'Review', step: 2 },
    { label: 'Book', step: 3 },
    { label: 'Payment', step: 4 },
  ];

  // Calculate progress percentage (ensure it's between 5% and 100%)
  const progressPercentage = Math.max(5, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in duration-300">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-1">Your Progress</p>
        <p className="text-sm text-slate-600">Step {currentStep} of {steps.length}</p>
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
                    ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50'
                    : isCurrent
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/50 animate-pulse'
                    : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

