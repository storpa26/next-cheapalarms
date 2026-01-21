import { Skeleton } from "../../ui/skeleton";
import { CreditCard, Loader2 } from "lucide-react";

/**
 * PaymentCardSkeleton - Loading skeleton for PaymentCard
 * Shown while invoice is being created after quote acceptance
 */
export function PaymentCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-7 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="rounded-full bg-secondary/15 p-4">
          <CreditCard className="h-6 w-6 text-secondary/50" />
        </div>
      </div>

      {/* Invoice Summary Skeleton */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 shadow-xl shadow-black/5 p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-baseline pb-4 border-b-2 border-border/40">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          
          <div className="rounded-xl bg-primary/10 p-4 border-2 border-primary/20">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Payment Amount Selection Skeleton */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl p-6">
          <Skeleton className="h-3 w-24 mb-4" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        
        <div className="rounded-2xl bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border border-white/40 shadow-lg p-6">
          <Skeleton className="h-3 w-32 mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Payment Form Skeleton */}
      <div className="mt-6">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
