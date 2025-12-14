import * as React from "react"
import { EmptyState } from "@/components/ui/empty-state"
import { Package } from "lucide-react"

export default function EmptyStateDemo() {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12" />}
      title="No items found"
      description="Get started by creating your first item. It will appear here once created."
      action={{
        label: "Create Item",
        onClick: () => alert("Create clicked"),
        variant: "default"
      }}
    />
  )
}

