import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm shadow-sm transition-colors duration-normal ease-standard",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

