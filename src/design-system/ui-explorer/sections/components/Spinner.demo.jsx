import * as React from "react"
import { Spinner } from "@/components/ui/spinner"
import { Stack } from "@/components/ui/stack"

export default function SpinnerDemo() {
  return (
    <Stack direction="row" gap={4} align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </Stack>
  )
}

