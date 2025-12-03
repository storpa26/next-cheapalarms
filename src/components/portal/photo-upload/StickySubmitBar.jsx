import { Check, AlertCircle, Loader2 } from "lucide-react";

/**
 * Sticky submit bar component
 * Fixed at bottom with validation message and submit button
 */
export function StickySubmitBar({ 
  isComplete, 
  incompleteCount, 
  onSubmit, 
  isSubmitting = false 
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-white border-t border-slate-100 p-5 pb-8 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3 justify-center">
          {isComplete ? (
            <p className="text-xs font-medium text-green-600 flex items-center gap-1">
              <Check size={14} /> All required items are ready
            </p>
          ) : (
            <p className="text-xs font-medium text-orange-600 flex items-center gap-1">
              <AlertCircle size={14} /> {incompleteCount} required item{incompleteCount !== 1 ? 's' : ''} still need attention
            </p>
          )}
        </div>
        
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className={`
            w-full py-4 rounded-full font-bold text-sm transition-all flex justify-center items-center gap-2
            ${isComplete 
              ? 'bg-primary text-white shadow-lg hover:shadow-xl active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Submitting photos...
            </>
          ) : (
            "Submit all photos"
          )}
        </button>
      </div>
    </div>
  );
}

