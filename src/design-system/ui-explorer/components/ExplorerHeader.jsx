import * as React from "react"
import { ChevronRight } from "lucide-react"

export function ExplorerHeader({ item }) {
  return (
    <div className="border-b border-border bg-surface px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span>{item.group}</span>
        <ChevronRight className="h-4 w-4" />
        <span>{item.title}</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
    </div>
  )
}

