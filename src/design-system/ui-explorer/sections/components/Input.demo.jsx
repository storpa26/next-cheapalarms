import * as React from "react"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Stack } from "../../../../components/ui/stack"

export default function InputDemo() {
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [placeholder, setPlaceholder] = React.useState("Enter text...")
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <Input
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError}
          className="max-w-sm"
        />
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Placeholder</label>
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="max-w-sm"
            />
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
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
          <Input placeholder="Error input" aria-invalid />
        </Stack>
      </div>
    </div>
  )
}

