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

  // Clean rectangular design with subtle color accents
  const variants = {
    default: "bg-surface border-border/60",
    sent: "bg-surface border-l-4 border-l-info bg-info-bg/30",
    accepted: "bg-surface border-l-4 border-l-success bg-success-bg/30",
    declined: "bg-surface border-l-4 border-l-error bg-error-bg/30",
    invoiced: "bg-surface border-l-4 border-l-primary bg-primary/5",
  };

  const iconColors = {
    default: "text-muted-foreground",
    sent: "text-info",
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
        rounded-lg border border-t-0 border-r border-b border-l-0
        p-6 shadow-sm hover:shadow-md
        transition-all duration-200 ease-standard
        ${onClick ? "cursor-pointer hover:border-border" : ""}
        h-full flex flex-col
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-md ${iconColors[variant] || iconColors.default} bg-background/80`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-1">
          <p className={`text-3xl font-bold ${valueColors[variant] || valueColors.default}`}>
            {currency} {typeof value === 'number' ? value.toFixed(2) : value}
          </p>
          
          {count !== undefined && count !== null && (
            <p className="text-sm text-muted-foreground font-medium">
              {count} {count === 1 ? 'estimate' : 'estimates'}
            </p>
          )}
          
          {trend !== undefined && trend !== null && trendLabel && (
            <div className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${trendColors[trendVariant]}`}>
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

