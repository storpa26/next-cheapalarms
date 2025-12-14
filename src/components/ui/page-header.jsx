import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import { Stack } from "./stack"

/**
 * PageHeader - Standard page header with title, description, and actions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.title - Page title
 * @param {React.ReactNode} props.description - Optional description text
 * @param {React.ReactNode} props.actions - Optional action buttons/controls
 * @param {string} props.className - Additional classes
 */
export function PageHeader({ title, description, actions, className, ...props }) {
  return (
    <Container className={cn("py-8", className)} {...props}>
      <Stack direction="row" gap={4} align="center" justify="between" className="flex-wrap">
        <div className="flex-1 min-w-0">
          {typeof title === 'string' ? (
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          ) : (
            title
          )}
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </Stack>
    </Container>
  )
}

