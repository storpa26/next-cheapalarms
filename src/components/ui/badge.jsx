import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-normal ease-standard focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        destructive:
          "border-transparent bg-error text-error-foreground shadow-sm hover:bg-error/90",
        outline: "border-border text-foreground bg-surface",
        success:
          "border-transparent bg-success text-success-foreground shadow-sm hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-sm hover:bg-warning/90",
        info:
          "border-transparent bg-info text-info-foreground shadow-sm hover:bg-info/90",
        muted:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
