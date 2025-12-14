import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-surface border-border text-foreground [&>svg]:text-foreground",
        success: "bg-success-bg border-success/50 text-foreground [&>svg]:text-success",
        error: "bg-error-bg border-error/50 text-foreground [&>svg]:text-error",
        warning: "bg-warning-bg border-warning/50 text-foreground [&>svg]:text-warning",
        info: "bg-info-bg border-info/50 text-foreground [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Icon components for convenience
const AlertIcon = ({ variant = "default", className }) => {
  const iconMap = {
    default: AlertCircle,
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }
  const Icon = iconMap[variant] || iconMap.default
  return <Icon className={cn("h-4 w-4", className)} />
}

export { Alert, AlertTitle, AlertDescription, AlertIcon }

