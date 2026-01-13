import * as React from "react"
import { Card } from "../../../components/ui/card"
import { cn } from "../../../lib/utils"

export function PreviewFrame({ children, className, ...props }) {
  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="min-h-[200px]">
        {children}
      </div>
    </Card>
  )
}

