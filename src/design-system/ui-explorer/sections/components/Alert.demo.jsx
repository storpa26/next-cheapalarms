import * as React from "react"
import { Alert, AlertTitle, AlertDescription, AlertIcon } from "../../../../components/ui/alert"
import { Stack } from "../../../../components/ui/stack"

export default function AlertDemo() {
  return (
    <Stack gap={4}>
      <Alert>
        <AlertIcon variant="default" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>This is a default alert message.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertIcon variant="success" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>Operation completed successfully.</AlertDescription>
      </Alert>
      <Alert variant="error">
        <AlertIcon variant="error" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertIcon variant="warning" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please review this carefully.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertIcon variant="info" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Here's some helpful information.</AlertDescription>
      </Alert>
    </Stack>
  )
}

