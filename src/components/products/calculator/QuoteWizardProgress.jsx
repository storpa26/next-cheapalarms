import { CheckCircle2, Circle } from "lucide-react";

/**
 * QuoteWizardProgress Component
 * 
 * Displays a 2-step progress indicator for the quote wizard:
 * 1. Configuration
 * 2. Contact Details
 */
export default function QuoteWizardProgress({ currentStep, onStepClick, sticky = false }) {
  const steps = [
    { label: 'Configuration', step: 1 },
    { label: 'Contact Details', step: 2 },
  ];

  // Calculate progress percentage
  const progressPercentage = Math.max(5, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  const containerClasses = `rounded-xl border border-border bg-background p-4 sm:p-6 shadow-sm animate-in fade-in duration-300 ${
    sticky ? 'lg:sticky lg:top-0 z-40 lg:bg-background/95 lg:backdrop-blur-md lg:border-b' : ''
  }`;

  return (
    <div className={containerClasses}>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-1">Quote Request Progress</p>
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
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-success border-success text-success-foreground scale-110 shadow-lg shadow-success/50 hover:scale-115'
                      : isCurrent
                      ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50 animate-pulse cursor-default'
                      : 'bg-muted border-border-subtle text-muted-foreground hover:border-primary/60'
                  } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
                  disabled={!onStepClick || isCurrent}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
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

