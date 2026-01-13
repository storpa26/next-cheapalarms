import * as React from "react"
import { Badge } from "../../../../components/ui/badge"
import { Stack } from "../../../../components/ui/stack"

export default function BadgeDemo() {
  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} className="flex-wrap">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="muted">Muted</Badge>
      </Stack>
    </Stack>
  )
}

