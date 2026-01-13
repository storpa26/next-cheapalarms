import * as React from "react"
import { toast } from "sonner"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card"
import { Stack } from "../../../../components/ui/stack"
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

export default function ToastDemo() {
  return (
    <div className="space-y-6">
      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Interactive toast notifications using sonner. Click buttons below to see them in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack gap={3}>
            <div>
              <h4 className="text-sm font-semibold mb-2">Success Toast</h4>
              <Button
                onClick={() => toast.success("Operation completed successfully!", {
                  description: "Your changes have been saved.",
                })}
              >
                <CheckCircle2 className="h-4 w-4" />
                Show Success Toast
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Error Toast</h4>
              <Button
                variant="destructive"
                onClick={() => toast.error("Something went wrong!", {
                  description: "Please try again or contact support.",
                })}
              >
                <XCircle className="h-4 w-4" />
                Show Error Toast
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Warning Toast</h4>
              <Button
                variant="outline"
                onClick={() => toast.warning("Warning: Action required", {
                  description: "Please review your settings before proceeding.",
                })}
              >
                <AlertTriangle className="h-4 w-4" />
                Show Warning Toast
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Info Toast</h4>
              <Button
                variant="outline"
                onClick={() => toast.info("New update available", {
                  description: "Check out the latest features in version 2.0",
                })}
              >
                <Info className="h-4 w-4" />
                Show Info Toast
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Loading Toast</h4>
              <Button
                variant="secondary"
                onClick={() => {
                  const toastId = toast.loading("Processing your request...", {
                    description: "This may take a few seconds.",
                  });
                  
                  // Simulate async operation
                  setTimeout(() => {
                    toast.success("Request completed!", {
                      id: toastId,
                      description: "Your data has been processed.",
                    });
                  }, 2000);
                }}
              >
                <Loader2 className="h-4 w-4" />
                Show Loading Toast
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Promise Toast</h4>
              <Button
                variant="outline"
                onClick={() => {
                  const promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                      Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
                    }, 2000);
                  });

                  toast.promise(promise, {
                    loading: "Processing...",
                    success: "Operation completed!",
                    error: "Operation failed!",
                  });
                }}
              >
                Show Promise Toast
              </Button>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Basic Usage</h4>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`import { toast } from "sonner";

// Success
toast.success("Operation completed!");

// Error
toast.error("Something went wrong!");

// With description
toast.success("Saved!", {
  description: "Your changes have been saved.",
});`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Loading & Promise</h4>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// Loading toast
const toastId = toast.loading("Processing...");
setTimeout(() => {
  toast.success("Done!", { id: toastId });
}, 2000);

// Promise toast
toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load",
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

