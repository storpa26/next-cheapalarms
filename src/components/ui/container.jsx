import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Container - Responsive container with max-width and padding
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {string} props.className - Additional classes
 * @param {boolean} props.fluid - If true, removes max-width constraint
 */
function Container({
  children,
  className,
  fluid = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        fluid ? "" : "max-w-7xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Container }

