/**
 * Progress bar component showing overall photo upload completion
 */
export function ProgressBar({ completed, total, percent }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
        <span>{completed} of {total} items ready</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

