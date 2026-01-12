import * as React from "react"
import { TimePicker, TimePickerTrigger, TimePickerContent } from "@/components/ui/time-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/stack"

export default function TimePickerDemo() {
  const [value, setValue] = React.useState("")
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [format, setFormat] = React.useState('12h')
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <TimePicker
          value={value}
          onValueChange={setValue}
          format={format}
          interval={15}
          disabled={disabled}
          className="max-w-sm w-full"
        >
          <TimePickerTrigger aria-invalid={hasError} placeholder="Select time..." />
          <TimePickerContent />
        </TimePicker>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Value: {value || "None"}</label>
            <TimePicker
              value={value}
              onValueChange={setValue}
              format={format}
              interval={15}
              className="max-w-sm w-full"
            >
              <TimePickerTrigger placeholder="Select time..." />
              <TimePickerContent />
            </TimePicker>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('12h')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    format === '12h' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  12 Hour
                </button>
                <button
                  onClick={() => setFormat('24h')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    format === '24h' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  24 Hour
                </button>
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
          </div>
        </CardContent>
      </Card>
      
      {/* All States */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All States</h3>
        <Stack gap={3}>
          <TimePicker defaultValue="" format="12h" className="w-full">
            <TimePickerTrigger placeholder="Select time..." />
            <TimePickerContent />
          </TimePicker>
          <TimePicker defaultValue="" format="12h" disabled className="w-full">
            <TimePickerTrigger placeholder="Disabled" />
            <TimePickerContent />
          </TimePicker>
          <TimePicker defaultValue="" format="12h" className="w-full">
            <TimePickerTrigger placeholder="Error state" aria-invalid />
            <TimePickerContent />
          </TimePicker>
        </Stack>
      </div>
    </div>
  )
}
