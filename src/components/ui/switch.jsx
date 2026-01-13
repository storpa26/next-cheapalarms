import * as React from "react"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, checked, disabled, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-normal ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-surface shadow-sm ring-0 transition-transform duration-normal ease-standard",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }

