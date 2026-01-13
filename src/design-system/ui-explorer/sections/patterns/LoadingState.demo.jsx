import * as React from "react"
import { LoadingState } from "../../../../components/ui/loading-state"
import { Stack } from "../../../../components/ui/stack"

export default function LoadingStateDemo() {
  return (
    <Stack gap={4}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Spinner Variant</h3>
        <LoadingState message="Loading data..." />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Skeleton Variant</h3>
        <LoadingState variant="skeleton" />
      </div>
    </Stack>
  )
}

