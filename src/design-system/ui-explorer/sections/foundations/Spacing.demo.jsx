import * as React from "react"
import { Stack } from "../../../../components/ui/stack"

export default function SpacingDemo() {
  const spacing = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  
  return (
    <div className="space-y-4">
      {spacing.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <div className="w-20 text-sm font-medium">{size}</div>
          <div className="flex-1">
            <div 
              className="bg-primary h-4 rounded"
              style={{ width: `${size * 0.25}rem` }}
            />
          </div>
          <div className="w-32 text-xs text-muted-foreground">
            {size * 0.25}rem ({size * 4}px)
          </div>
        </div>
      ))}
    </div>
  )
}

