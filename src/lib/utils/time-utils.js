/**
 * Time utility functions for TimePicker component
 * Provides time slot generation, formatting, and validation
 */

/**
 * Generate time slots for hour selection
 * @param {number} startHour - Starting hour (0-23)
 * @param {number} endHour - Ending hour (0-23)
 * @returns {Array<number>} Array of hours
 */
export function generateHours(startHour = 0, endHour = 23) {
  const hours = []
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i)
  }
  return hours
}

/**
 * Generate time slots for minute selection
 * @param {number} interval - Minute interval (e.g., 15, 30)
 * @returns {Array<number>} Array of minutes
 */
export function generateMinutes(interval = 15) {
  const minutes = []
  for (let i = 0; i < 60; i += interval) {
    minutes.push(i)
  }
  return minutes
}

/**
 * Generate all time slots
 * @param {number} interval - Minute interval (default: 15)
 * @param {string} format - Format ('12h' or '24h')
 * @returns {Array<Object>} Array of time slot objects: [{ value: '10:00', label: '10:00 AM' }]
 */
export function generateTimeSlots(interval = 15, format = '12h') {
  const slots = []
  const hours = generateHours()
  const minutes = generateMinutes(interval)

  hours.forEach((hour) => {
    minutes.forEach((minute) => {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const label = formatTime(value, format)
      slots.push({ value, label, hour, minute })
    })
  })

  return slots
}

/**
 * Format time for display
 * @param {string} time - Time string (HH:mm)
 * @param {string} format - Format ('12h' or '24h')
 * @returns {string} Formatted time string
 */
export function formatTime(time, format = '12h') {
  if (!time) return ''
  
  // Parse time string (HH:mm)
  const [hoursStr, minutesStr] = time.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr || '0', 10)

  if (isNaN(hours) || isNaN(minutes)) return time

  if (format === '24h') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  // 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM'
  let displayHours = hours % 12
  if (displayHours === 0) displayHours = 12

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Parse time string to object
 * @param {string} timeString - Time string (HH:mm or "10:30 AM")
 * @returns {Object|null} { hour, minute, period } or null if invalid
 */
export function parseTime(timeString) {
  if (!timeString) return null

  // Try parsing as HH:mm (24-hour format)
  const match24 = timeString.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    const hour = parseInt(match24[1], 10)
    const minute = parseInt(match24[2], 10)
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute, period: hour >= 12 ? 'PM' : 'AM' }
    }
  }

  // Try parsing as 12-hour format (e.g., "10:30 AM")
  const match12 = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match12) {
    let hour = parseInt(match12[1], 10)
    const minute = parseInt(match12[2], 10)
    const period = match12[3].toUpperCase()

    if (hour === 12) hour = 0
    if (period === 'PM') hour += 12
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute, period }
    }
  }

  return null
}

/**
 * Convert time string to minutes (for comparison)
 * @param {string} timeString - Time string (HH:mm)
 * @returns {number} Minutes since midnight, or -1 if invalid
 */
export function timeToMinutes(timeString) {
  const parsed = parseTime(timeString)
  if (!parsed) return -1
  return parsed.hour * 60 + parsed.minute
}

/**
 * Validate time string
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid
 */
export function isValidTime(timeString) {
  return parseTime(timeString) !== null
}

/**
 * Convert 12-hour format time to 24-hour format (HH:mm)
 * @param {string} timeString - Time string (e.g., "10:30 AM")
 * @returns {string|null} 24-hour format (HH:mm) or null if invalid
 */
export function convertTo24Hour(timeString) {
  const parsed = parseTime(timeString)
  if (!parsed) return null
  return `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
}

/**
 * Convert 24-hour format time to 12-hour format
 * @param {string} timeString - Time string (HH:mm)
 * @returns {string|null} 12-hour format (e.g., "10:30 AM") or null if invalid
 */
export function convertTo12Hour(timeString) {
  return formatTime(timeString, '12h')
}

/**
 * Get current time in 24-hour format
 * @returns {string} Current time (HH:mm)
 */
export function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/**
 * Formats a date string as a relative time (e.g., "2h ago", "3d ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
