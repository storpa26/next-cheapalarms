import * as React from "react"
import { cn } from "../../lib/utils"
import { Stack } from "./stack"

/**
 * SectionHeader - Standard section header with title and optional description/actions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.title - Section title
 * @param {React.ReactNode} props.description - Optional description text
 * @param {React.ReactNode} props.actions - Optional action buttons/controls
 * @param {string} props.className - Additional classes
 */
export function SectionHeader({ title, description, actions, className, ...props }) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      <Stack direction="row" gap={4} align="center" justify="between" className="flex-wrap">
        <div className="flex-1 min-w-0">
          {typeof title === 'string' ? (
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          ) : (
            title
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
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
    </div>
  )
}

