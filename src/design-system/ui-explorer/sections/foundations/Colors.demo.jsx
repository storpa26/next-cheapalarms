import * as React from "react"
import { Grid } from "../../../../components/ui/grid"
import { Stack } from "../../../../components/ui/stack"
import { useEffect, useState } from "react"

export default function ColorsDemo() {
  const [computedColors, setComputedColors] = useState({})
  
  useEffect(() => {
    // Read computed CSS variable values
    const root = document.documentElement
    const colors = {
      background: getComputedStyle(root).getPropertyValue('--color-bg').trim(),
      surface: getComputedStyle(root).getPropertyValue('--color-surface').trim(),
      primary: getComputedStyle(root).getPropertyValue('--color-primary').trim(),
      secondary: getComputedStyle(root).getPropertyValue('--color-secondary').trim(),
      success: getComputedStyle(root).getPropertyValue('--color-success').trim(),
      error: getComputedStyle(root).getPropertyValue('--color-error').trim(),
      warning: getComputedStyle(root).getPropertyValue('--color-warning').trim(),
      info: getComputedStyle(root).getPropertyValue('--color-info').trim(),
      muted: getComputedStyle(root).getPropertyValue('--color-muted').trim(),
      text: getComputedStyle(root).getPropertyValue('--color-text').trim(),
      'text-muted': getComputedStyle(root).getPropertyValue('--color-text-muted').trim(),
    }
    setComputedColors(colors)
  }, [])
  
  const semanticColors = [
    { name: "Background", token: "bg-background", var: "--color-bg", value: computedColors.background },
    { name: "Surface", token: "bg-surface", var: "--color-surface", value: computedColors.surface },
    { name: "Muted", token: "bg-muted", var: "--color-muted", value: computedColors.muted },
    { name: "Primary", token: "bg-primary", var: "--color-primary", value: computedColors.primary },
    { name: "Secondary", token: "bg-secondary", var: "--color-secondary", value: computedColors.secondary },
    { name: "Success", token: "bg-success", var: "--color-success", value: computedColors.success },
    { name: "Error", token: "bg-error", var: "--color-error", value: computedColors.error },
    { name: "Warning", token: "bg-warning", var: "--color-warning", value: computedColors.warning },
    { name: "Info", token: "bg-info", var: "--color-info", value: computedColors.info },
  ]
  
  return (
    <Stack gap={6}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Semantic Colors</h3>
        <Grid cols={{ sm: 2, md: 3 }} gap={4}>
          {semanticColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`h-20 w-full rounded-lg border border-border ${color.token}`} />
              <div className="text-xs">
                <div className="font-medium">{color.name}</div>
                <div className="text-muted-foreground">{color.var}</div>
                {color.value && (
                  <div className="text-muted-foreground">{color.value}</div>
                )}
              </div>
            </div>
          ))}
        </Grid>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Text Colors</h3>
        <Grid cols={{ sm: 2, md: 3 }} gap={4}>
          <div className="space-y-2">
            <div className="h-16 w-full rounded-lg border border-border bg-background flex items-center justify-center">
              <span className="text-foreground">Foreground</span>
            </div>
            <div className="text-xs">
              <div className="font-medium">Foreground</div>
              <div className="text-muted-foreground">--color-text</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-16 w-full rounded-lg border border-border bg-background flex items-center justify-center">
              <span className="text-muted-foreground">Muted</span>
            </div>
            <div className="text-xs">
              <div className="font-medium">Muted</div>
              <div className="text-muted-foreground">--color-text-muted</div>
            </div>
          </div>
        </Grid>
      </div>
    </Stack>
  )
}

