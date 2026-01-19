import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectContextValue {
  value: string | null
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  options: Map<string, string>
  registerOption: (value: string, label: string) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  value: null,
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
  options: new Map(),
  registerOption: () => {},
})

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(({ 
  className, 
  children, 
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...props 
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }

  const optionsMap = React.useRef(new Map<string, string>())
  const [options, setOptions] = React.useState(new Map<string, string>())

  const registerOption = React.useCallback((value: string, label: string) => {
    optionsMap.current.set(value, label)
    setOptions(new Map(optionsMap.current))
  }, [])

  return (
    <SelectContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: handleOpenChange,
      options: options,
      registerOption,
    }}>
      <div className={cn("relative", className)} ref={ref} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children?: React.ReactNode
  placeholder?: string
  "aria-invalid"?: boolean
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(({ 
  className, 
  children,
  placeholder = "Select an option...",
  "aria-invalid": ariaInvalid,
  ...props 
}, ref) => {
  const { open, onOpenChange, value } = React.useContext(SelectContext)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const combinedRef = React.useRef<HTMLButtonElement | null>(null)
  
  React.useImperativeHandle(ref, () => combinedRef.current!)
  React.useEffect(() => {
    combinedRef.current = triggerRef.current
  }, [])

  const handleClick = () => {
    onOpenChange(!open)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpenChange(!open)
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-invalid={ariaInvalid}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border bg-surface px-3 py-1 text-sm shadow-sm transition-all duration-normal ease-standard",
        "focus-visible:outline-none",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:rounded-md before:p-[1px]",
        open 
          ? "before:bg-gradient-to-r before:from-primary before:to-secondary" 
          : "before:bg-transparent",
        "before:transition-all before:duration-normal before:ease-standard",
        "after:absolute after:inset-[1px] after:rounded-[calc(0.375rem-1px)] after:bg-surface",
        open && "ring-2 ring-ring ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:before:bg-transparent",
        ariaInvalid && "before:bg-gradient-to-r before:from-error before:to-error",
        className
      )}
      disabled={props.disabled}
      {...props}
    >
      <span className={cn(
        "flex-1 text-left truncate relative z-10",
        !value && "text-muted-foreground"
      )}>
        {children || placeholder}
      </span>
      <ChevronDown 
        className={cn(
          "h-4 w-4 transition-transform duration-normal ease-standard relative z-10",
          "text-foreground/60",
          open && "rotate-180",
          open && "text-primary"
        )}
        style={open ? {
          background: "linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        } : {}}
      />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  position?: "bottom" | "top"
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(({ 
  className, 
  children,
  position = "bottom",
  ...props 
}, ref) => {
  const { open, onOpenChange } = React.useContext(SelectContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const combinedRef = React.useRef<HTMLDivElement | null>(null)
  
  React.useImperativeHandle(ref, () => combinedRef.current!)
  React.useEffect(() => {
    combinedRef.current = contentRef.current
  }, [])

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        const trigger = (e.target as Element).closest('[role="combobox"]')
        if (!trigger) {
          onOpenChange(false)
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  const positionClasses = {
    bottom: "top-full mt-1",
    top: "bottom-full mb-1",
  }

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        "absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface shadow-elevated",
        "opacity-0 scale-95",
        positionClasses[position],
        className
      )}
      style={{
        animation: "fadeIn 0.15s ease-out forwards, scaleIn 0.15s ease-out forwards"
      }}
      {...props}
    >
      <div className="max-h-[300px] overflow-auto p-1">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ 
  className, 
  children,
  value,
  disabled,
  ...props 
}, ref) => {
  const { value: selectedValue, onValueChange, registerOption } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  React.useEffect(() => {
    if (value !== undefined && children) {
      registerOption(value, typeof children === 'string' ? children : String(children))
    }
  }, [value, children, registerOption])

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!disabled) {
        onValueChange(value)
      }
    }
  }

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors duration-fast ease-standard",
        isSelected && "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium",
        !isSelected && "hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10",
        !isSelected && "focus:bg-state-hover-bg",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/80" />
      )}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
  children?: React.ReactNode
}

const SelectValue = ({ placeholder, children, ...props }: SelectValueProps) => {
  const { value, options } = React.useContext(SelectContext)
  
  if (children) {
    return <span {...props}>{children}</span>
  }
  
  const label = value ? options.get(value) : null
  
  return <span {...props}>{label || value || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

export { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem,
  SelectValue 
}
