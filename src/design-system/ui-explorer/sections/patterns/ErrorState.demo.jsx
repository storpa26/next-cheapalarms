import * as React from "react"
import { ErrorState } from "../../../../components/ui/error-state"

export default function ErrorStateDemo() {
  return (
    <ErrorState
      title="Failed to load data"
      message="There was an error loading the requested data. Please try again."
      action={{
        label: "Retry",
        onClick: () => alert("Retry clicked"),
        variant: "default"
      }}
    />
  )
}

