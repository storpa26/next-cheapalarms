import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-card",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl mt-4" />
    </div>
  );
}

export function WorkflowProgressSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4">
        <Skeleton className="h-3 w-24 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-12 mt-2" />
            </div>
            {i < 4 && <Skeleton className="flex-1 h-1 mx-2 rounded-full" />}
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
    </div>
  );
}
