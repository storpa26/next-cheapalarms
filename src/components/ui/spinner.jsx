import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const ringMap = {
  sm: "border-[2px]",
  md: "border-[3px]",
  lg: "border-[4px]",
  xl: "border-[5px]",
};

export function Spinner({ className, size = "md", ...props }) {
  const sizeClass = sizeMap[size] ?? sizeMap.md;
  const ringClass = ringMap[size] ?? ringMap.md;

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", sizeClass, className)}
      aria-hidden="true"
      {...props}
    >
      <span className="absolute inset-0 rounded-full bg-primary/25 blur-2xl opacity-70 animate-pulse" />
      <span className="absolute inset-[3px] rounded-full border border-white/40 dark:border-white/10" />
      <span
        className={cn(
          "absolute inset-0 rounded-full border-transparent border-t-primary border-r-secondary animate-[spin_1.1s_linear_infinite]",
          ringClass
        )}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-full border-transparent border-t-secondary border-l-primary opacity-35 animate-[spin_2.4s_linear_infinite]",
          ringClass
        )}
      />
    </span>
  );
}

export function SpinnerOverlay({
  children,
  message = "Switching views…",
  subtext = "Syncing your latest updates",
  className,
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-linear-to-br from-card via-background to-card px-6 py-5 text-center shadow-[0_25px_65px_-30px_rgba(201,83,117,0.8)]",
        className
      )}
    >
      <Spinner size="lg" className="text-primary" />
      <div>
        <p className="text-sm font-semibold text-primary">{message}</p>
        {subtext ? <p className="text-xs text-muted-foreground">{subtext}</p> : null}
      </div>
      {children}
    </div>
  );
}

