import * as React from "react"
import { cn } from "../../lib/utils"
import { Stack } from "./stack"
import { Button } from "./button"

/**
 * EmptyState - Component for displaying empty data states
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Optional icon/illustration
 * @param {React.ReactNode} props.title - Empty state title
 * @param {React.ReactNode} props.description - Empty state description
 * @param {React.ReactNode} props.action - Optional action button
 * @param {string} props.className - Additional classes
 */
export function EmptyState({ icon, title, description, action, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      <Stack gap={4} align="center">
        {icon && (
          <div className="text-muted-foreground opacity-50">
            {icon}
          </div>
        )}
        
        <Stack gap={2} align="center">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground max-w-sm">
              {description}
            </p>
          )}
        </Stack>
        
        {action && (
          <div className="mt-2">
            {typeof action === 'string' || React.isValidElement(action) ? (
              action
            ) : (
              <Button onClick={action.onClick} variant={action.variant || 'default'}>
                {action.label}
              </Button>
            )}
          </div>
        )}
      </Stack>
    </div>
  )
}

