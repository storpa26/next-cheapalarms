import * as React from "react"
import { SectionHeader } from "../../../../components/ui/section-header"
import { Button } from "../../../../components/ui/button"

export default function SectionHeaderDemo() {
  return (
    <SectionHeader
      title="Section Title"
      description="Optional section description"
      actions={<Button variant="outline" size="sm">Action</Button>}
    />
  )
}

