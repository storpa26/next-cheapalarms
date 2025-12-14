import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/stack"

export default function SwitchDemo() {
  const [checked, setChecked] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch
            checked={checked}
            onClick={() => !disabled && setChecked(!checked)}
            disabled={disabled}
          />
          <span className="text-sm">Enable notifications</span>
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
          </div>
        </CardContent>
      </Card>
      
      {/* All States */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All States</h3>
        <Stack gap={3}>
          <label className="flex items-center gap-2">
            <Switch checked={false} onClick={() => {}} />
            <span className="text-sm">Off</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={true} onClick={() => {}} />
            <span className="text-sm">On</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={false} disabled />
            <span className="text-sm">Disabled (off)</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={true} disabled />
            <span className="text-sm">Disabled (on)</span>
          </label>
        </Stack>
      </div>
      
      {/* Group Example */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Switch Group</h3>
        <Stack gap={2}>
          <label className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <Switch checked={true} onClick={() => {}} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Push notifications</span>
            <Switch checked={false} onClick={() => {}} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">SMS notifications</span>
            <Switch checked={true} onClick={() => {}} />
          </label>
        </Stack>
      </div>
    </div>
  )
}

