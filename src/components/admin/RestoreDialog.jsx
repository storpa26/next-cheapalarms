import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

/**
 * Confirmation dialog for bulk restore operations
 */
export function RestoreDialog({
  open,
  onOpenChange,
  onConfirm,
  count,
  isLoading = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore {count} estimate{count !== 1 ? 's' : ''}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will restore {count} estimate{count !== 1 ? 's' : ''} and move {count !== 1 ? 'them' : 'it'} back to your active estimates list.
            </p>
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-bg/50 p-3 mt-3">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-warning">
                <strong>Note:</strong> Portal meta and user links were deleted and will need to be recreated from GHL if needed. They will regenerate on next sync or when the estimate is accessed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isLoading ? "Restoring..." : "Restore"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

