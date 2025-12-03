import { Check } from "lucide-react";

/**
 * Status pill component for product upload status
 * Displays: Ready (green), Skipped (gray), Pending (red)
 */
export function StatusPill({ status }) {
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
        <Check size={12} strokeWidth={3} /> Ready
      </span>
    );
  }
  
  if (status === 'skipped') {
    return (
      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">
        Skipped
      </span>
    );
  }
  
  return (
    <span className="px-3 py-1 bg-white text-red-500 text-xs font-semibold rounded-full border border-red-200">
      Pending
    </span>
  );
}

