import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  generateHours,
  generateMinutes,
  formatTime,
  parseTime,
} from "../../lib/utils/time-utils"

const TimePickerContext = React.createContext({
  value: null,
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
})

const TimePicker = React.forwardRef(({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  format = '12h',
  interval = 15,
  disabled,
  placeholder = "Select time...",
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

  return (
    <TimePickerContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: handleOpenChange,
      format,
      interval,
      disabled,
      placeholder,
    }}>
      <div className={cn("relative", className)} ref={ref} {...props}>
        {children}
      </div>
    </TimePickerContext.Provider>
  )
})
TimePicker.displayName = "TimePicker"

const TimePickerTrigger = React.forwardRef(({
  className,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}, ref) => {
  const { open, onOpenChange, value, disabled, placeholder, format } = React.useContext(TimePickerContext)
  const triggerRef = React.useRef(null)

  React.useImperativeHandle(ref, () => triggerRef.current)

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

  const displayValue = value ? formatTime(value, format) : null

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-invalid={ariaInvalid}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-xl border bg-surface px-4 py-2 text-base shadow-sm transition-all duration-normal ease-standard",
        "focus-visible:outline-none",
        // Gradient border on focus - using brand colors
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:rounded-xl before:p-[1px]",
        open 
          ? "before:bg-gradient-to-r before:from-primary before:to-secondary" 
          : "before:bg-transparent",
        "before:transition-all before:duration-normal before:ease-standard",
        "after:absolute after:inset-[1px] after:rounded-[calc(0.75rem-1px)] after:bg-surface",
        // Focus ring
        open && "ring-2 ring-ring ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:before:bg-transparent",
        // Error state
        ariaInvalid && "before:bg-gradient-to-r before:from-error before:to-error",
        className
      )}
      {...props}
    >
      <span className={cn(
        "flex-1 text-left truncate relative z-10 flex items-center gap-2",
        !displayValue && "text-muted-foreground"
      )}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        {children || displayValue || placeholder}
      </span>
      <Clock 
        className={cn(
          "h-4 w-4 transition-transform duration-normal ease-standard relative z-10",
          "text-foreground/60",
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
TimePickerTrigger.displayName = "TimePickerTrigger"

const TimePickerContent = React.forwardRef(({
  className,
  position = "bottom",
  ...props
}, ref) => {
  const { open, onOpenChange, value, onValueChange, format, interval } = React.useContext(TimePickerContext)
  const contentRef = React.useRef(null)
  const hourColumnRef = React.useRef(null)
  const minuteColumnRef = React.useRef(null)

  React.useImperativeHandle(ref, () => contentRef.current)

  // Parse current value
  const parsedTime = React.useMemo(() => {
    if (!value) return null
    const parsed = parseTime(value)
    if (!parsed) return null
    
    // If 24h format, convert to 12h for internal use
    if (format === '12h') {
      const hour24 = parsed.hour
      const period = hour24 >= 12 ? 'PM' : 'AM'
      let hour12 = hour24 % 12
      if (hour12 === 0) hour12 = 12
      return { hour: hour12, minute: parsed.minute, period }
    }
    return parsed
  }, [value, format])

  // Initialize selectedPeriod from parsedTime
  const [selectedPeriod, setSelectedPeriod] = React.useState(() => {
    if (value && format === '12h') {
      const parsed = parseTime(value)
      if (parsed) {
        return parsed.hour >= 12 ? 'PM' : 'AM'
      }
    }
    return 'AM'
  })

  React.useEffect(() => {
    if (parsedTime && format === '12h') {
      setSelectedPeriod(parsedTime.period || 'AM')
    }
  }, [parsedTime, format])

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
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

  // Scroll to selected time when opened
  React.useEffect(() => {
    if (open && parsedTime) {
      setTimeout(() => {
        if (hourColumnRef.current) {
          const hourElement = hourColumnRef.current.querySelector(`[data-hour="${parsedTime.hour}"]`)
          if (hourElement) {
            hourElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }
        }
        if (minuteColumnRef.current) {
          const minuteElement = minuteColumnRef.current.querySelector(`[data-minute="${parsedTime.minute}"]`)
          if (minuteElement) {
            minuteElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }
        }
      }, 100)
    }
  }, [open, parsedTime])

  const handleHourClick = (hour) => {
    const currentMinute = parsedTime?.minute || 0
    const currentPeriod = format === '12h' ? selectedPeriod : 'AM'
    
    let hour24 = hour
    if (format === '12h') {
      if (currentPeriod === 'PM' && hour !== 12) hour24 = hour + 12
      if (currentPeriod === 'AM' && hour === 12) hour24 = 0
    }
    
    const newTime = `${String(hour24).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    onValueChange(newTime)
  }

  const handleMinuteClick = (minute) => {
    const currentHour = parsedTime?.hour || 12
    const currentPeriod = format === '12h' ? selectedPeriod : 'AM'
    
    let hour24 = currentHour
    if (format === '12h') {
      if (currentPeriod === 'PM' && currentHour !== 12) hour24 = currentHour + 12
      if (currentPeriod === 'AM' && currentHour === 12) hour24 = 0
    }
    
    const newTime = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onValueChange(newTime)
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    if (parsedTime) {
      const currentHour = parsedTime.hour
      const currentMinute = parsedTime.minute || 0
      
      let hour24 = currentHour
      if (period === 'PM' && currentHour !== 12) hour24 = currentHour + 12
      if (period === 'AM' && currentHour === 12) hour24 = 0
      
      const newTime = `${String(hour24).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
      onValueChange(newTime)
    }
  }

  if (!open) return null

  const positionClasses = {
    bottom: "top-full mt-2",
    top: "bottom-full mb-2",
  }

  const hours = generateHours()
  const minutes = generateMinutes(interval)
  
  // Filter hours for 12h format (1-12)
  const displayHours = format === '12h' 
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : hours

  const selectedHour = parsedTime?.hour || (format === '12h' ? 12 : 0)
  const selectedMinute = parsedTime?.minute || 0

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "absolute z-50 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-elevated",
        "opacity-0 scale-95",
        positionClasses[position],
        className
      )}
      style={{
        animation: "fadeIn 0.15s ease-out forwards, scaleIn 0.15s ease-out forwards"
      }}
      {...props}
    >
      {/* Time Display Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-2xl font-semibold text-foreground text-center">
          {value ? formatTime(value, format) : '--:--'}
        </div>
      </div>

      {/* Time Selection */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Hour Column */}
          <div className="relative">
            <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Hour
            </div>
            <div
              ref={hourColumnRef}
              className="max-h-[200px] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
              }}
            >
              <div className="space-y-1">
                {displayHours.map((hour) => {
                  const isSelected = hour === selectedHour
                  return (
                    <button
                      key={hour}
                      type="button"
                      data-hour={hour}
                      onClick={() => handleHourClick(hour)}
                      className={cn(
                        "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-normal ease-standard",
                        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        isSelected 
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-110" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {hour}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Minute Column */}
          <div className="relative">
            <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Minute
            </div>
            <div
              ref={minuteColumnRef}
              className="max-h-[200px] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
              }}
            >
              <div className="space-y-1">
                {minutes.map((minute) => {
                  const isSelected = minute === selectedMinute
                  return (
                    <button
                      key={minute}
                      type="button"
                      data-minute={minute}
                      onClick={() => handleMinuteClick(minute)}
                      className={cn(
                        "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-normal ease-standard",
                        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        isSelected 
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-110" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AM/PM Toggle (12h format only) */}
        {format === '12h' && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => handlePeriodChange('AM')}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-normal ease-standard",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                selectedPeriod === 'AM'
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                  : "border border-border bg-surface hover:bg-muted text-foreground"
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('PM')}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-normal ease-standard",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                selectedPeriod === 'PM'
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                  : "border border-border bg-surface hover:bg-muted text-foreground"
              )}
            >
              PM
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
TimePickerContent.displayName = "TimePickerContent"

export { TimePicker, TimePickerTrigger, TimePickerContent }
