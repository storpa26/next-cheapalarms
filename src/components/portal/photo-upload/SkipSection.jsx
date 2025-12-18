import { AlertCircle } from "lucide-react";

/**
 * Skip section component - allows users to skip photo with reason
 * Shows warning and requires explanation
 */
export function SkipSection({ 
  skipReason, 
  onSkipReasonChange, 
  onCancel 
}) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-warning-bg rounded-xl p-4 mb-4 flex gap-3 items-start">
        <AlertCircle className="text-warning shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-foreground leading-relaxed">
          Skipping a required photo may delay your installation process. You may optionally provide a reason below.
        </p>
      </div>

      <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
        Reason for skipping (optional)
      </label>
      <textarea 
        value={skipReason}
        onChange={(e) => onSkipReasonChange(e.target.value)}
        autoFocus
        placeholder="e.g. Device hasn't arrived yet, or the room is under renovation."
        className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-32 mb-4"
      />

      <button 
        type="button"
        onClick={onCancel}
        className="text-sm text-primary font-medium hover:underline"
      >
        Go back to adding photos
      </button>
    </div>
  );
}

