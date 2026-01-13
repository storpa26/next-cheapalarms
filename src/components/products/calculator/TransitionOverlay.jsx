import { useEffect, memo } from "react";
import { Sparkles } from "lucide-react";
import { Progress } from "../../ui/progress";

/**
 * TransitionOverlay Component
 * 
 * Shows a loading overlay with progress bar during step transitions
 */
function TransitionOverlay({ 
  isVisible, 
  progress, 
  message = "Preparing your quote request..." 
}) {
  useEffect(() => {
    if (isVisible) {
      // Prevent body scroll during transition
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md transition-opacity duration-normal ease-standard"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Transition in progress"
      aria-live="polite"
    >
      <div className="w-full max-w-md mx-4">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-background to-card p-4 sm:p-6 md:p-8 text-center shadow-[0_30px_80px_-40px_rgba(201,83,117,0.9)]">
          {/* Icon */}
          <div className="flex justify-center mb-6" aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-base font-semibold text-foreground mb-4">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress: ${Math.round(progress)}%`}>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TransitionOverlay);
