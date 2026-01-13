import * as React from "react"
import { cn } from "../../lib/utils"
import { Stack } from "./stack"
import { Spinner } from "./spinner"
import { Skeleton } from "./skeleton"

/**
 * LoadingState - Component for displaying loading states
 * 
 * @param {Object} props
 * @param {string} props.message - Optional loading message
 * @param {'spinner'|'skeleton'} props.variant - Loading variant
 * @param {React.ReactNode} props.children - Custom loading content
 * @param {string} props.className - Additional classes
 */
export function LoadingState({ message, variant = 'spinner', children, className, ...props }) {
  if (children) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)} {...props}>
        {children}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-4 py-8", className)} {...props}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 gap-4",
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}

