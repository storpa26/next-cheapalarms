import * as React from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Stack } from "../../../../components/ui/stack"

export default function SelectDemo() {
  const [disabled, setDisabled] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [value, setValue] = React.useState("")
  
  const options = [
    { value: "", label: "Select an option..." },
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ]
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <Select
          value={value}
          onValueChange={setValue}
          disabled={disabled}
          className="max-w-sm w-full"
        >
          <SelectTrigger aria-invalid={hasError} placeholder="Select an option...">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.value === ""}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Value: {value || "None"}</label>
            <Select
              value={value}
              onValueChange={setValue}
              className="max-w-sm w-full"
            >
              <SelectTrigger placeholder="Select an option...">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.value === ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Select defaultValue="" className="w-full">
            <SelectTrigger placeholder="Select an option...">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>Select an option...</SelectItem>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="1" disabled className="w-full">
            <SelectTrigger placeholder="Select an option...">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>Select an option...</SelectItem>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="" className="w-full">
            <SelectTrigger aria-invalid placeholder="Select an option...">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>Select an option...</SelectItem>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </Stack>
      </div>
      
      {/* Brand Showcase */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Brand Colors in Action</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Notice the gradient border on focus, animated chevron, and brand-colored selected items.
        </p>
        <Select defaultValue="premium" className="w-full">
          <SelectTrigger placeholder="Choose a plan...">
            <SelectValue placeholder="Choose a plan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic Plan</SelectItem>
            <SelectItem value="premium">Premium Plan</SelectItem>
            <SelectItem value="enterprise">Enterprise Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
