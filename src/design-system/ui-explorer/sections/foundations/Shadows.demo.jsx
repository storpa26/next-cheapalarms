import * as React from "react"
import { Grid } from "../../../../components/ui/grid"

export default function ShadowsDemo() {
  const shadows = [
    { name: "None", class: "shadow-none" },
    { name: "Small", class: "shadow-sm" },
    { name: "Medium", class: "shadow-md" },
    { name: "Large", class: "shadow-lg" },
    { name: "XL", class: "shadow-xl" },
    { name: "2XL", class: "shadow-2xl" },
    { name: "Card", class: "shadow-card" },
    { name: "Elevated", class: "shadow-elevated" },
  ]
  
  return (
    <Grid cols={{ sm: 2, md: 3, lg: 4 }} gap={4}>
      {shadows.map((shadow) => (
        <div key={shadow.name} className="space-y-2">
          <div className={`h-24 w-full rounded-lg bg-surface border border-border ${shadow.class}`} />
          <div className="text-xs font-medium text-center">{shadow.name}</div>
        </div>
      ))}
    </Grid>
  )
}

