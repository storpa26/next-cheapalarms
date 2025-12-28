import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export function StepContent({
  step,
  portalMeta,
  onAction,
  actionState,
  externalSystems,
  onContinue,
}) {
  const isCompleted = actionState?.completed;
  const isProcessing = actionState?.processing;
  const results = actionState?.results;

  const handleAction = async () => {
    await onAction(step.action, {});
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  // Edge case: Handle rejected estimate
  if (portalMeta.quote?.status === 'rejected') {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-bold mb-2">Estimate Rejected</h2>
            <p className="text-muted-foreground">
              This estimate has been rejected. The workflow cannot proceed further.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please reset to start a new workflow.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show results after action completes
  if (isCompleted && results) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold">{step.title} ✓</h2>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">✅ What Happened:</h3>
            {step.whatHappens.map((item, idx) => {
              // Find matching system result - try direct match first, then fallback to common keys
              let systemResult = results?.systems?.[item.system];
              if (!systemResult && results?.systems) {
                // Try to find by common system names
                const systemKeys = Object.keys(results.systems);
                const matchingKey = systemKeys.find(key => {
                  const keyLower = key.toLowerCase();
                  const systemLower = item.system.toLowerCase();
                  return keyLower.includes(systemLower) || systemLower.includes(keyLower);
                });
                if (matchingKey) {
                  systemResult = results.systems[matchingKey];
                }
              }
              const isSuccess = systemResult?.status === 'success' || 
                               systemResult?.status === 'completed' || 
                               systemResult?.status === 'active' ||
                               !systemResult; // Default to success if no result (for simpler actions)

              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {isSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                    {systemResult?.details && (
                      <div className="mt-2 text-xs">
                        <Badge variant="outline" className="mr-2">
                          {systemResult.details.id || systemResult.details.status}
                        </Badge>
                        {systemResult.details.message && (
                          <span className="text-muted-foreground">
                            {systemResult.details.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {step.nextStep && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">→ Next:</div>
                  <div className="font-medium">Step {step.nextStep}</div>
                </div>
                <Button onClick={handleContinue}>
                  Continue to Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Show processing state
  if (isProcessing) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <h2 className="text-xl font-bold">Processing...</h2>
          </div>

          <div className="space-y-2">
            {step.whatHappens.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <div>
                  <div className="font-medium">{item.action}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show before action (default state)
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Step {step.id}</Badge>
            <Badge variant={step.actor === 'customer' ? 'default' : 'secondary'}>
              {step.actor === 'customer' ? 'Customer' : 'Admin'}
            </Badge>
          </div>
          <h2 className="text-xl font-bold">{step.title}</h2>
          <p className="text-muted-foreground mt-1">{step.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">When you click the button, this will happen:</h3>
          {step.whatHappens.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <span className="text-lg font-bold text-muted-foreground">{idx + 1}.</span>
              </div>
              <div>
                <div className="font-medium">{item.action}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            onClick={handleAction}
            size="lg"
            className="w-full"
            disabled={isProcessing}
          >
            {step.action === 'request-quote' && 'Request Quote'}
            {step.action === 'send-estimate' && 'Send Estimate to Customer'}
            {step.action === 'upload-photos' && 'Upload Photo'}
            {step.action === 'submit-photos' && 'Submit Photos for Review'}
            {step.action === 'approve-and-enable' && 'Approve Photos & Enable Acceptance'}
            {step.action === 'enable-acceptance' && 'Enable Acceptance'}
            {step.action === 'accept' && 'Accept Estimate'}
            {step.action === 'pay-partial' && 'Make Payment'}
            {step.action === 'request-changes' && 'Request Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

