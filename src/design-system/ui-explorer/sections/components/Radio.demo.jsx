import * as React from "react"
import { Radio } from "../../../../components/ui/radio"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Stack } from "../../../../components/ui/stack"

export default function RadioDemo() {
  const [value, setValue] = React.useState("option1")
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Radio
              name="preview-radio"
              value="option1"
              checked={value === "option1"}
              onChange={(e) => setValue(e.target.value)}
              disabled={disabled}
              aria-invalid={hasError}
            />
            <span className="text-sm">Option 1</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Radio
              name="preview-radio"
              value="option2"
              checked={value === "option2"}
              onChange={(e) => setValue(e.target.value)}
              disabled={disabled}
              aria-invalid={hasError}
            />
            <span className="text-sm">Option 2</span>
          </label>
        </div>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selected: {value}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="control-radio"
                  value="option1"
                  checked={value === "option1"}
                  onChange={(e) => setValue(e.target.value)}
                />
                <span className="text-sm">Option 1</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="control-radio"
                  value="option2"
                  checked={value === "option2"}
                  onChange={(e) => setValue(e.target.value)}
                />
                <span className="text-sm">Option 2</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
            <Radio name="states-1" />
            <span className="text-sm">Unchecked</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="states-1" defaultChecked />
            <span className="text-sm">Checked</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="states-2" disabled />
            <span className="text-sm">Disabled (unchecked)</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="states-2" defaultChecked disabled />
            <span className="text-sm">Disabled (checked)</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="states-3" aria-invalid />
            <span className="text-sm">Error State</span>
          </label>
        </Stack>
      </div>
      
      {/* Group Example */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Radio Group</h3>
        <Stack gap={2}>
          <label className="flex items-center gap-2">
            <Radio name="group-example" value="small" />
            <span className="text-sm">Small</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="group-example" value="medium" defaultChecked />
            <span className="text-sm">Medium</span>
          </label>
          <label className="flex items-center gap-2">
            <Radio name="group-example" value="large" />
            <span className="text-sm">Large</span>
          </label>
        </Stack>
      </div>
    </div>
  )
}

