import { Check } from "lucide-react";

/**
 * Status pill component for product upload status
 * Displays: Ready (green), Skipped (gray), Pending (red)
 */
export function StatusPill({ status }) {
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-success-bg text-success text-xs font-semibold rounded-full border border-success/50">
        <Check size={12} strokeWidth={3} /> Ready
      </span>
    );
  }
  
  if (status === 'skipped') {
    return (
      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full border border-border-subtle">
        Skipped
      </span>
    );
  }
  
  return (
    <span className="px-3 py-1 bg-background text-error text-xs font-semibold rounded-full border border-error/50">
      Pending
    </span>
  );
}

