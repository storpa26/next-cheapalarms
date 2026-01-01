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
import { Radio } from "@/components/ui/radio";

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isLoading,
  showScopeSelection = true,
  scope = 'both',
  onScopeChange,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Delete Item'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || `Are you sure you want to delete ${itemName}? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {showScopeSelection && (
          <div className="py-4">
            <label className="text-sm font-medium mb-3 block">Delete from:</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Radio
                  id="scope-local"
                  name="delete-scope"
                  value="local"
                  checked={scope === 'local'}
                  onChange={(e) => onScopeChange(e.target.value)}
                />
                <label htmlFor="scope-local" className="cursor-pointer text-sm">
                  WordPress only (local database)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Radio
                  id="scope-ghl"
                  name="delete-scope"
                  value="ghl"
                  checked={scope === 'ghl'}
                  onChange={(e) => onScopeChange(e.target.value)}
                />
                <label htmlFor="scope-ghl" className="cursor-pointer text-sm">
                  GoHighLevel only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Radio
                  id="scope-both"
                  name="delete-scope"
                  value="both"
                  checked={scope === 'both'}
                  onChange={(e) => onScopeChange(e.target.value)}
                />
                <label htmlFor="scope-both" className="cursor-pointer text-sm font-medium">
                  Both (WordPress + GoHighLevel)
                </label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {scope === 'both' && (
                <span className="text-warning">
                  ⚠️ If GHL deletion fails, local deletion will be skipped (fail-closed).
                </span>
              )}
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

