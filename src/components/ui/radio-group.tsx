import * as React from "react"
import { cn } from "../../lib/utils"

interface RadioGroupContextValue {
  value: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({ value: "" })

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(({ className, value, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(value || "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // Update internal value when controlled value changes
  React.useEffect(() => {
    if (isControlled && value !== undefined) {
      // Controlled component - value is managed externally
    } else if (!isControlled && value !== undefined) {
      setInternalValue(value)
    }
  }, [value, isControlled])

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  className?: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(({ className, value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  const isChecked = context.value === value

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        ref={ref}
        id={id}
        checked={isChecked}
        onChange={() => context.onValueChange?.(value)}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "checked:bg-primary checked:border-primary cursor-pointer",
          className
        )}
        {...props}
      />
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
