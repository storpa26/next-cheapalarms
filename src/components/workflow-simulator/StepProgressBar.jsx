import { CheckCircle2, Circle } from 'lucide-react';
import { getCurrentStep } from '../../lib/workflow-simulator/steps';

export function StepProgressBar({ portalMeta, currentStepId }) {
  const totalSteps = 8;
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  // Use prop if provided, otherwise compute from portalMeta
  const currentStep = currentStepId || getCurrentStep(portalMeta);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((stepNum) => {
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isPending = stepNum > currentStep;

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNum}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1 text-center ${
                    isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Step {stepNum}
                </span>
              </div>
              {stepNum < totalSteps && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

