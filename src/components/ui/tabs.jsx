import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext({
  value: null,
  onValueChange: () => {},
})

export function Tabs({ value, defaultValue, onValueChange, children, className, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || null)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleValueChange = React.useCallback((newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [isControlled, onValueChange])

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, ...props }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all duration-normal ease-standard",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-surface text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({ value, className, ...props }) {
  const { value: selectedValue } = React.useContext(TabsContext)
  
  if (selectedValue !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

