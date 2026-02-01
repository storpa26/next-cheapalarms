import { memo } from "react";
import { Send, CheckCircle2, XCircle, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import { DEFAULT_CURRENCY } from "../../lib/admin/constants";

export const SummaryCard = memo(function SummaryCard({ 
  label, 
  value, 
  currency = DEFAULT_CURRENCY, 
  variant = "default", 
  onClick,
  icon,
  count,
  trend,
  trendLabel
}) {
  const iconMap = {
    sent: Send,
    accepted: CheckCircle2,
    declined: XCircle,
    invoiced: Receipt,
    default: null,
  };

  const Icon = icon || iconMap[variant] || null;

  // Professional design with gradients and enhanced depth
  const variants = {
    default: "bg-gradient-to-br from-surface to-surface/95 border-border/60 shadow-md hover:shadow-lg",
    sent: "bg-gradient-to-br from-surface via-info-bg/20 to-surface border-l-4 border-l-[#1EA6DF] shadow-md hover:shadow-lg",
    accepted: "bg-gradient-to-br from-surface via-success-bg/20 to-surface border-l-4 border-l-success shadow-md hover:shadow-lg",
    declined: "bg-gradient-to-br from-surface via-error-bg/20 to-surface border-l-4 border-l-error shadow-md hover:shadow-lg",
    invoiced: "bg-gradient-to-br from-surface via-primary/10 to-surface border-l-4 border-l-primary shadow-md hover:shadow-lg",
  };

  const iconColors = {
    default: "text-muted-foreground",
    sent: "text-[#1EA6DF]",
    accepted: "text-success",
    declined: "text-error",
    invoiced: "text-primary",
  };

  const valueColors = {
    default: "text-foreground",
    sent: "text-foreground",
    accepted: "text-foreground",
    declined: "text-foreground",
    invoiced: "text-foreground",
  };

  const trendColors = {
    positive: "text-success",
    negative: "text-error",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : null;
  const trendVariant = trend && trend > 0 ? "positive" : trend && trend < 0 ? "negative" : "neutral";

  return (
    <div
      className={`
        ${variants[variant] || variants.default}
        rounded-xl border border-t-0 border-r border-b border-l-0
        p-7
        transition-all duration-300 ease-standard
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:border-border/80" : ""}
        h-full flex flex-col
        backdrop-blur-sm
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-lg ${iconColors[variant] || iconColors.default} bg-background/90 shadow-sm border border-border/40`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <p className="text-sm font-semibold text-muted-foreground tracking-wide">{label}</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-2">
          <p className={`text-3xl font-bold tracking-tight ${valueColors[variant] || valueColors.default}`}>
            {currency} {typeof value === 'number' ? value.toFixed(2) : value}
          </p>
          
          {count !== undefined && count !== null && (
            <p className="text-sm text-muted-foreground font-semibold">
              {count} {count === 1 ? 'estimate' : 'estimates'}
            </p>
          )}
          
          {trend !== undefined && trend !== null && trendLabel && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold mt-3 ${trendColors[trendVariant]}`}>
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

