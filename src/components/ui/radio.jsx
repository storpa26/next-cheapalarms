import * as React from "react"
import { cn } from "../../lib/utils"

const Radio = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      className={cn(
        "h-4 w-4 rounded-full border-input bg-surface text-primary shadow-sm transition-colors duration-normal ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        "checked:bg-primary checked:border-primary",
        "cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Radio.displayName = "Radio"

export { Radio }

