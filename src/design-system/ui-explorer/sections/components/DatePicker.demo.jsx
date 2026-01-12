import * as React from "react"
import { DatePicker, DatePickerTrigger, DatePickerContent } from "@/components/ui/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/stack"

export default function DatePickerDemo() {
  const [value, setValue] = React.useState("")
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <DatePicker
          value={value}
          onValueChange={setValue}
          minDate={today}
          disabled={disabled}
          className="max-w-sm w-full"
        >
          <DatePickerTrigger aria-invalid={hasError} placeholder="Select date..." />
          <DatePickerContent />
        </DatePicker>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Value: {value || "None"}</label>
            <DatePicker
              value={value}
              onValueChange={setValue}
              minDate={today}
              className="max-w-sm w-full"
            >
              <DatePickerTrigger placeholder="Select date..." />
              <DatePickerContent />
            </DatePicker>
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
          <DatePicker defaultValue="" className="w-full">
            <DatePickerTrigger placeholder="Select date..." />
            <DatePickerContent />
          </DatePicker>
          <DatePicker defaultValue="" disabled className="w-full">
            <DatePickerTrigger placeholder="Disabled" />
            <DatePickerContent />
          </DatePicker>
          <DatePicker defaultValue="" className="w-full">
            <DatePickerTrigger placeholder="Error state" aria-invalid />
            <DatePickerContent />
          </DatePicker>
        </Stack>
      </div>
    </div>
  )
}
