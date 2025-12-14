import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { Stack } from "./stack"

/**
 * StatCard - Card component for displaying statistics/metrics
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.title - Stat title/label
 * @param {React.ReactNode} props.value - Stat value (number, string, or custom)
 * @param {React.ReactNode} props.description - Optional description/hint
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {React.ReactNode} props.trend - Optional trend indicator
 * @param {string} props.className - Additional classes
 * @param {'default'|'success'|'error'|'warning'|'info'} props.variant - Color variant
 */
export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  variant = 'default',
  className,
  ...props 
}) {
  const variantStyles = {
    default: "",
    success: "border-success/20 bg-success-bg/50",
    error: "border-error/20 bg-error-bg/50",
    warning: "border-warning/20 bg-warning-bg/50",
    info: "border-info/20 bg-info-bg/50",
  }

  return (
    <Card className={cn(variantStyles[variant], className)} {...props}>
      <CardContent className="p-6">
        <Stack gap={3}>
          {(title || icon) && (
            <div className="flex items-center justify-between">
              {title && (
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
              )}
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
          )}
          
          <div>
            {typeof value === 'string' || typeof value === 'number' ? (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            ) : (
              value
            )}
            {trend && <div className="mt-1">{trend}</div>}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

