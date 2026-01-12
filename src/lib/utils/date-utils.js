/**
 * Date utility functions for DatePicker component
 * Provides calendar grid generation, date formatting, and validation
 */

/**
 * Get calendar grid for a given month/year
 * Returns array of weeks, each week is array of 7 days
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (0-11, where 0 = January)
 * @returns {Array<Array<Object>>} Array of weeks, each week contains day objects
 */
export function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 6 = Saturday

  const weeks = []
  let currentWeek = []

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    currentWeek.push({
      date: new Date(year, month - 1, day),
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    currentWeek.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: false,
    })

    // Start new week on Sunday
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Add days from next month to complete last week
  let nextMonthDay = 1
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push({
      date: new Date(year, month + 1, nextMonthDay),
      day: nextMonthDay,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
    nextMonthDay++
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} ISO date string
 */
export function formatDateToISO(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse ISO date string to Date object
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDateFromISO(dateString) {
  if (!dateString) return null
  const date = new Date(dateString + 'T00:00:00')
  if (isNaN(date.getTime())) return null
  return date
}

/**
 * Format date for display
 * @param {Date|string} date - Date object or ISO string
 * @param {string} format - Format type ('long', 'short', 'iso')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'long') {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseDateFromISO(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''

  if (format === 'iso') {
    return formatDateToISO(dateObj)
  }

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Long format (default)
  return dateObj.toLocaleDateString('en-AU', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Check if date is today
 * @param {Date} date - Date object
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  if (!date || !(date instanceof Date)) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

/**
 * Check if date1 is before date2 (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
export function isBefore(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseDateFromISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseDateFromISO(date2) : date2
  if (!d1 || !d2) return false
  const d1DateOnly = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
  const d2DateOnly = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  return d1DateOnly < d2DateOnly
}

/**
 * Check if date1 is after date2 (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 is after date2
 */
export function isAfter(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseDateFromISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseDateFromISO(date2) : date2
  if (!d1 || !d2) return false
  const d1DateOnly = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
  const d2DateOnly = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  return d1DateOnly > d2DateOnly
}

/**
 * Validate date is within min/max range
 * @param {Date|string} date - Date to validate
 * @param {Date|string} minDate - Minimum date (optional)
 * @param {Date|string} maxDate - Maximum date (optional)
 * @returns {boolean} True if date is valid
 */
export function isValidDate(date, minDate, maxDate) {
  if (!date) return false
  const dateObj = typeof date === 'string' ? parseDateFromISO(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return false

  if (minDate) {
    const min = typeof minDate === 'string' ? parseDateFromISO(minDate) : minDate
    if (min && isBefore(dateObj, min)) return false
  }

  if (maxDate) {
    const max = typeof maxDate === 'string' ? parseDateFromISO(maxDate) : maxDate
    if (max && isAfter(dateObj, max)) return false
  }

  return true
}

/**
 * Get today's date in ISO format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getTodayDate() {
  return formatDateToISO(new Date())
}

/**
 * Add months to a date
 * @param {Date|string} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date object
 */
export function addMonths(date, months) {
  const dateObj = typeof date === 'string' ? parseDateFromISO(date) : date
  if (!dateObj) return new Date()
  const newDate = new Date(dateObj)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

/**
 * Get month/year label for display
 * @param {Date} date - Date object
 * @returns {string} Formatted month/year (e.g., "January 2024")
 */
export function getMonthYearLabel(date) {
  if (!date || !(date instanceof Date)) return ''
  return date.toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })
}
