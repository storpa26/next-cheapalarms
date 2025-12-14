import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"

export default function PageHeaderDemo() {
  return (
    <PageHeader
      title="Page Title"
      description="This is a page description that provides context about the page content."
      actions={<Button>Action</Button>}
    />
  )
}

