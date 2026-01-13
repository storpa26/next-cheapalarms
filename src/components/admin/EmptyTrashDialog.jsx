import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

/**
 * Empty Trash Dialog
 * Confirmation dialog for permanently deleting all items in trash
 */
export function EmptyTrashDialog({
  open,
  onOpenChange,
  onConfirm,
  itemCount = 0,
  isLoading = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-error/10 p-2">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <AlertDialogTitle>Empty Trash</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 space-y-2">
            <p>
              This action will permanently delete all {itemCount} item{itemCount !== 1 ? 's' : ''} in trash.
              This cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground">
              All deleted estimates will be permanently removed from the system. 
              This includes all associated data such as portal metadata, uploads, and job links.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || itemCount === 0}
            className="bg-error text-error-foreground hover:bg-error/90"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Deleting...</span>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </>
            ) : (
              `Delete ${itemCount} Item${itemCount !== 1 ? 's' : ''}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

