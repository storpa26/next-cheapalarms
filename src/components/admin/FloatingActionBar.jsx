import { X, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Floating action bar that appears when items are selected
 * Sticky on scroll, shows selection count and actions
 */
export function FloatingActionBar({
  selectedCount,
  onClearSelection,
  onRestoreSelected,
  onDeleteSelected,
  isLoading = false,
  className,
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 ${className}`}
    >
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg">
        <Badge variant="secondary" className="text-sm font-medium">
          {selectedCount} selected
        </Badge>
        <div className="flex items-center gap-2">
          {onRestoreSelected && (
            <Button
              onClick={onRestoreSelected}
              disabled={isLoading}
              size="sm"
              variant="default"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {isLoading ? "Restoring..." : "Restore Selected"}
            </Button>
          )}
          {onDeleteSelected && (
            <Button
              onClick={onDeleteSelected}
              disabled={isLoading}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isLoading ? "Deleting..." : "Delete Selected"}
            </Button>
          )}
          {onClearSelection && (
            <Button
              onClick={onClearSelection}
              disabled={isLoading}
              size="sm"
              variant="ghost"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

