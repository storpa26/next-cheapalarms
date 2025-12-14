import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/stack"

export default function TextareaDemo() {
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [rows, setRows] = React.useState(4)
  const [placeholder, setPlaceholder] = React.useState("Enter your message...")
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <Textarea
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
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
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full max-w-sm rounded-md border border-input bg-surface px-3 py-1 text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Rows: {rows}</label>
            <input
              type="range"
              min="2"
              max="10"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full max-w-sm"
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
          <Textarea placeholder="Default textarea" />
          <Textarea placeholder="Disabled textarea" disabled />
          <Textarea placeholder="Error textarea" aria-invalid />
          <Textarea placeholder="Small textarea (2 rows)" rows={2} />
          <Textarea placeholder="Large textarea (8 rows)" rows={8} />
        </Stack>
      </div>
    </div>
  )
}

