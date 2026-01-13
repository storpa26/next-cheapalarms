import * as React from "react"
import { cn } from "../../lib/utils"
import { Stack } from "./stack"
import { Alert, AlertDescription, AlertTitle, AlertIcon } from "./alert"
import { Button } from "./button"
import { AlertCircle } from "lucide-react"

/**
 * ErrorState - Component for displaying error states
 * 
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {React.ReactNode} props.icon - Optional custom icon
 * @param {Object} props.action - Optional action button { label, onClick, variant }
 * @param {'default'|'error'|'warning'} props.variant - Alert variant
 * @param {string} props.className - Additional classes
 */
export function ErrorState({ 
  title = "Something went wrong",
  message,
  icon,
  action,
  variant = 'error',
  className,
  ...props 
}) {
  return (
    <div className={cn("py-8", className)} {...props}>
      <Alert variant={variant}>
        {icon || <AlertIcon variant={variant} />}
        <AlertTitle>{title}</AlertTitle>
        {message && (
          <AlertDescription>
            {message}
          </AlertDescription>
        )}
        {action && (
          <div className="mt-4">
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={action.size || 'default'}
            >
              {action.label}
            </Button>
          </div>
        )}
      </Alert>
    </div>
  )
}

