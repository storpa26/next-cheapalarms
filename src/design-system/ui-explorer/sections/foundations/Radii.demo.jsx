import * as React from "react"
import { Grid } from "../../../../components/ui/grid"

export default function RadiiDemo() {
  const radii = [
    { name: "None", class: "rounded-none", value: "0" },
    { name: "Small", class: "rounded-sm", value: "0.125rem (2px)" },
    { name: "Medium", class: "rounded-md", value: "0.375rem (6px)" },
    { name: "Large", class: "rounded-lg", value: "0.5rem (8px)" },
    { name: "XL", class: "rounded-xl", value: "0.75rem (12px)" },
    { name: "2XL", class: "rounded-2xl", value: "1rem (16px)" },
    { name: "3XL", class: "rounded-3xl", value: "1.5rem (24px)" },
    { name: "Full", class: "rounded-full", value: "9999px" },
  ]
  
  return (
    <Grid cols={{ sm: 2, md: 3, lg: 4 }} gap={4}>
      {radii.map((radius) => (
        <div key={radius.name} className="space-y-2">
          <div className={`h-20 w-full bg-primary ${radius.class}`} />
          <div className="text-xs">
            <div className="font-medium">{radius.name}</div>
            <div className="text-muted-foreground">{radius.value}</div>
          </div>
        </div>
      ))}
    </Grid>
  )
}

