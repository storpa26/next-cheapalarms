"use client";

import * as React from "react"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
  getCalendarGrid,
  formatDateToISO,
  parseDateFromISO,
  formatDate,
  isToday,
  isSameDay,
  isValidDate,
  addMonths,
  getMonthYearLabel,
  isBefore,
  isAfter,
} from "../../lib/utils/date-utils"

const DatePickerContext = React.createContext({
  value: null,
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
})

const DatePicker = React.forwardRef(({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  minDate,
  maxDate,
  disabled,
  placeholder = "Select date...",
  ...props
}, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const isControlled = value !== undefined
  const isOpenControlled = controlledOpen !== undefined
  const currentValue = isControlled ? value : internalValue
  const open = isOpenControlled ? controlledOpen : internalOpen

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    if (!isOpenControlled) {
      setInternalOpen(false)
    } else {
      onOpenChange?.(false)
    }
  }

  const handleOpenChange = (newOpen) => {
    if (!disabled) {
      if (!isOpenControlled) {
        setInternalOpen(newOpen)
      } else {
        onOpenChange?.(newOpen)
      }
    }
  }

  return (
    <DatePickerContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: handleOpenChange,
      minDate,
      maxDate,
      disabled,
      placeholder,
    }}>
      <div className={cn("relative", className)} ref={ref} {...props}>
        {children}
      </div>
    </DatePickerContext.Provider>
  )
})
DatePicker.displayName = "DatePicker"

const DatePickerTrigger = React.forwardRef(({
  className,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}, ref) => {
  const { open, onOpenChange, value, disabled, placeholder } = React.useContext(DatePickerContext)
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

  const displayValue = value ? formatDate(value, 'short') : null

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
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {children || displayValue || placeholder}
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
DatePickerTrigger.displayName = "DatePickerTrigger"

const DatePickerContent = React.forwardRef(({
  className,
  position = "bottom",
  ...props
}, ref) => {
  const { open, onOpenChange, value, onValueChange, minDate, maxDate } = React.useContext(DatePickerContext)
  const contentRef = React.useRef(null)
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const selectedDate = value ? parseDateFromISO(value) : new Date()
    return selectedDate || new Date()
  })

  React.useImperativeHandle(ref, () => contentRef.current)

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

  // Update current month when value changes
  React.useEffect(() => {
    if (value) {
      const parsed = parseDateFromISO(value)
      if (parsed) {
        setCurrentMonth(parsed)
      }
    }
  }, [value])

  // Check if previous/next month buttons should be disabled
  const canGoPrevious = React.useMemo(() => {
    if (!minDate) return true
    const min = parseDateFromISO(minDate)
    if (!min) return true
    const prevMonth = addMonths(currentMonth, -1)
    // Compare by year/month, not by specific day (allows navigation if month contains valid dates)
    return prevMonth.getFullYear() > min.getFullYear() || 
           (prevMonth.getFullYear() === min.getFullYear() && prevMonth.getMonth() >= min.getMonth())
  }, [currentMonth, minDate])

  const canGoNext = React.useMemo(() => {
    if (!maxDate) return true
    const max = parseDateFromISO(maxDate)
    if (!max) return true
    const nextMonth = addMonths(currentMonth, 1)
    // Compare by year/month, not by specific day (allows navigation if month contains valid dates)
    return nextMonth.getFullYear() < max.getFullYear() || 
           (nextMonth.getFullYear() === max.getFullYear() && nextMonth.getMonth() <= max.getMonth())
  }, [currentMonth, maxDate])

  const handlePreviousMonth = () => {
    if (!canGoPrevious) return
    setCurrentMonth(prev => addMonths(prev, -1))
  }

  const handleNextMonth = () => {
    if (!canGoNext) return
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    const today = formatDateToISO(new Date())
    if (isValidDate(today, minDate, maxDate)) {
      onValueChange(today)
    }
  }

  const handleClear = () => {
    onValueChange("")
  }

  const handleDateClick = (date) => {
    const isoDate = formatDateToISO(date)
    if (isValidDate(isoDate, minDate, maxDate)) {
      onValueChange(isoDate)
    }
  }

  if (!open) return null

  const positionClasses = {
    bottom: "top-full mt-2",
    top: "bottom-full mb-2",
  }

  const selectedDate = value ? parseDateFromISO(value) : null
  const calendarGrid = getCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth())
  const monthYearLabel = getMonthYearLabel(currentMonth)

  // Mark selected days in calendar grid
  const gridWithSelection = calendarGrid.map(week =>
    week.map(day => ({
      ...day,
      isSelected: selectedDate ? isSameDay(day.date, selectedDate) : false,
    }))
  )

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "absolute z-50 w-[320px] overflow-hidden rounded-xl border border-border bg-surface shadow-elevated",
        "opacity-0 scale-95",
        positionClasses[position],
        className
      )}
      style={{
        animation: "fadeIn 0.15s ease-out forwards, scaleIn 0.15s ease-out forwards"
      }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handlePreviousMonth}
          disabled={!canGoPrevious}
          className="h-8 w-8 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-base font-semibold text-foreground">
          {monthYearLabel}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="h-8 w-8 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {gridWithSelection.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const isoDate = formatDateToISO(day.date)
              const isDisabled = !isValidDate(isoDate, minDate, maxDate)
              const isSelected = day.isSelected
              const isTodayDate = day.isToday

              return (
                <button
                  key={`${weekIdx}-${dayIdx}`}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={isDisabled || !day.isCurrentMonth}
                  className={cn(
                    "h-10 w-10 rounded-lg text-sm font-medium transition-all duration-normal ease-standard",
                    "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30",
                    // Current month
                    day.isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50",
                    // Today
                    isTodayDate && !isSelected && "border-2 border-primary",
                    // Selected
                    isSelected && "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg scale-110",
                    // Hover
                    !isSelected && !isDisabled && day.isCurrentMonth && "hover:bg-muted",
                    // Disabled
                    isDisabled && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label={`Select ${formatDate(day.date, 'short')}`}
                  aria-selected={isSelected}
                >
                  {day.day}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-xs"
        >
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="text-xs"
        >
          Today
        </Button>
      </div>
    </div>
  )
})
DatePickerContent.displayName = "DatePickerContent"

export { DatePicker, DatePickerTrigger, DatePickerContent }
