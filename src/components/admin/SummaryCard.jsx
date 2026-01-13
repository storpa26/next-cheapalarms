import { memo } from "react";
import { DEFAULT_CURRENCY } from "../../lib/admin/constants";

export const SummaryCard = memo(function SummaryCard({ label, value, currency = DEFAULT_CURRENCY, variant = "default", onClick }) {
  const variants = {
    default: "bg-background border-border",
    sent: "bg-background border-info/50",
    accepted: "bg-background border-success/50",
    declined: "bg-background border-error/50",
    invoiced: "bg-background border-primary/50",
  };

  const valueColors = {
    default: "text-foreground",
    sent: "text-info",
    accepted: "text-success",
    declined: "text-error",
    invoiced: "text-primary",
  };

  return (
    <div
      className={`
        ${variants[variant] || variants.default}
        rounded-lg border p-5 shadow-sm
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
      `}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className={`text-2xl font-bold ${valueColors[variant] || valueColors.default}`}>
        {currency} {typeof value === 'number' ? value.toFixed(2) : value}
      </p>
    </div>
  );
});

