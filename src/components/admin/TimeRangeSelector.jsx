"use client";

import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
];

export function TimeRangeSelector({ value, onChange, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {RANGES.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(range.value)}
          className={cn(
            "transition-all duration-200 ease-standard",
            value === range.value
              ? "bg-gradient-to-r from-secondary to-secondary-hover text-white shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30"
              : "bg-surface hover:bg-muted/50"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
