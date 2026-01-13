import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const SelectContext = React.createContext({
  value: null,
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
  options: new Map(), // value -> label mapping
  registerOption: () => {},
})

const Select = React.forwardRef(({ 
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
  
  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  const handleOpenChange = (newOpen) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }

  const optionsMap = React.useRef(new Map())

  const registerOption = React.useCallback((value, label) => {
    optionsMap.current.set(value, label)
  }, [])

  return (
    <SelectContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: handleOpenChange,
      options: optionsMap.current,
      registerOption,
    }}>
      <div className={cn("relative", className)} ref={ref} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ 
  className, 
  children,
  placeholder = "Select an option...",
  "aria-invalid": ariaInvalid,
  ...props 
}, ref) => {
  const { open, onOpenChange, value } = React.useContext(SelectContext)
  const triggerRef = React.useRef(null)
  const combinedRef = React.useRef(null)
  
  React.useImperativeHandle(ref, () => combinedRef.current)
  React.useEffect(() => {
    combinedRef.current = triggerRef.current
  }, [])

  const handleClick = () => {
    onOpenChange(!open)
  }

  const handleKeyDown = (e) => {
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
        // Gradient border on focus - using brand colors
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:rounded-md before:p-[1px]",
        open 
          ? "before:bg-gradient-to-r before:from-primary before:to-secondary" 
          : "before:bg-transparent",
        "before:transition-all before:duration-normal before:ease-standard",
        "after:absolute after:inset-[1px] after:rounded-[calc(0.375rem-1px)] after:bg-surface",
        // Focus ring
        open && "ring-2 ring-ring ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:before:bg-transparent",
        // Error state
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
          // Gradient chevron on open
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

const SelectContent = React.forwardRef(({ 
  className, 
  children,
  position = "bottom",
  ...props 
}, ref) => {
  const { open, onOpenChange } = React.useContext(SelectContext)
  const contentRef = React.useRef(null)
  const combinedRef = React.useRef(null)
  
  React.useImperativeHandle(ref, () => combinedRef.current)
  React.useEffect(() => {
    combinedRef.current = contentRef.current
  }, [])

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        // Check if click is on trigger
        const trigger = e.target.closest('[role="combobox"]')
        if (!trigger) {
          onOpenChange(false)
        }
      }
    }

    const handleEscape = (e) => {
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

const SelectItem = React.forwardRef(({ 
  className, 
  children,
  value,
  disabled,
  ...props 
}, ref) => {
  const { value: selectedValue, onValueChange, registerOption } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  // Register this option so SelectValue can find its label
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

  const handleKeyDown = (e) => {
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
        // Selected state with brand gradient (always visible, even on hover)
        isSelected && "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium",
        // Hover state with brand gradient (only when NOT selected)
        !isSelected && "hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10",
        // Focus state (only when NOT selected)
        !isSelected && "focus:bg-state-hover-bg",
        // Disabled state
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

const SelectValue = ({ placeholder, children, ...props }) => {
  const { value, options } = React.useContext(SelectContext)
  
  // If children provided, use it (for custom rendering)
  if (children) {
    return <span {...props}>{children}</span>
  }
  
  // Otherwise, try to find the label from registered options
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
