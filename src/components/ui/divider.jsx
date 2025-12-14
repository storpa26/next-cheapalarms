import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Divider - Horizontal or vertical divider line
 * 
 * @param {Object} props
 * @param {string} props.className - Additional classes
 * @param {'horizontal'|'vertical'} props.orientation - Divider orientation (default: 'horizontal')
 * @param {string} props.label - Optional label text
 */
function Divider({
  className,
  orientation = 'horizontal',
  label,
  ...props
}) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          "w-px bg-border",
          className
        )}
        {...props}
      />
    )
  }

  if (label) {
    return (
      <div
        className={cn(
          "flex items-center gap-4",
          className
        )}
        {...props}
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-px bg-border",
        className
      )}
      {...props}
    />
  )
}

export { Divider }

