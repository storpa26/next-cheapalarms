import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/stack"

export default function CheckboxDemo() {
  const [checked, setChecked] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={disabled}
            aria-invalid={hasError}
          />
          <span className="text-sm">Accept terms and conditions</span>
        </label>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span className="text-sm">Checked</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              <span className="text-sm">Disabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasError}
                onChange={(e) => setHasError(e.target.checked)}
              />
              <span className="text-sm">Error State</span>
            </label>
          </div>
        </CardContent>
      </Card>
      
      {/* All States */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All States</h3>
        <Stack gap={3}>
          <label className="flex items-center gap-2">
            <Checkbox />
            <span className="text-sm">Unchecked</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            <span className="text-sm">Checked</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox disabled />
            <span className="text-sm">Disabled (unchecked)</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox defaultChecked disabled />
            <span className="text-sm">Disabled (checked)</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox aria-invalid />
            <span className="text-sm">Error State</span>
          </label>
        </Stack>
      </div>
      
      {/* Group Example */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Checkbox Group</h3>
        <Stack gap={2}>
          <label className="flex items-center gap-2">
            <Checkbox />
            <span className="text-sm">Option 1</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox />
            <span className="text-sm">Option 2</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox />
            <span className="text-sm">Option 3</span>
          </label>
        </Stack>
      </div>
    </div>
  )
}

