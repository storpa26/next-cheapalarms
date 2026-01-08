/**
 * Error handling utilities for admin pages
 */

/**
 * Checks if an error is an authentication error (401)
 * @param {string} message - Error message
 * @returns {boolean}
 */
export function isAuthError(message) {
  return /401/.test(message) || /unauthor/i.test(message);
}

/**
 * Checks if an error is a permission error (403)
 * @param {string} message - Error message
 * @returns {boolean}
 */
export function isPermissionError(message) {
  return /403/.test(message) || /forbidden/i.test(message) || /insufficient privileges/i.test(message);
}

/**
 * Gets a user-friendly error message for permission errors
 * @param {string} feature - Feature name (e.g., "admin dashboard", "estimates")
 * @param {string} capability - Required capability (e.g., "ca_view_estimates")
 * @returns {string}
 */
export function getPermissionErrorMessage(feature = "this page", capability = "required capabilities") {
  return `You don't have permission to access ${feature}. Please contact an administrator to grant you the ${capability}.`;
}

/**
 * Extracts a clean error message from an error object
 * @param {Error|unknown} error - Error object
 * @returns {string}
 */
export function extractErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Formats retry-after seconds into user-friendly message
 * @param {number} seconds - Retry-after in seconds
 * @returns {string|null} Formatted message or null if invalid
 * @private
 */
function formatRetryAfterMessage(seconds) {
  // Validate: must be positive number, reasonable upper bound (24 hours)
  if (!isNaN(seconds) && seconds > 0 && seconds <= 86400) {
    const minutes = Math.ceil(seconds / 60);
    if (minutes > 1) {
      return `Rate limit exceeded. Please try again in ${minutes} minutes.`;
    } else {
      return `Rate limit exceeded. Please try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`;
    }
  }
  return null;
}

/**
 * Parses wpFetch error message to extract clean error from JSON response
 * wpFetch throws: "WP error 400 Bad Request: {"ok":false,"error":"...","code":"..."}"
 * This extracts just the error message from the JSON
 * 
 * @param {Error|string|unknown} error - Error from wpFetch
 * @returns {string} Clean error message
 * @example
 * parseWpFetchError(new Error('WP error 429: {"retry_after": 60}'))
 * // Returns: "Rate limit exceeded. Please try again in 1 minute."
 * 
 * parseWpFetchError(new Error('WP error 400: {"error": "Invalid request"}'))
 * // Returns: "Invalid request"
 */
export function parseWpFetchError(error) {
  // Limit error message length to prevent regex DoS on very long strings
  const MAX_ERROR_MESSAGE_LENGTH = 10000;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const errorMessage = rawMessage.length > MAX_ERROR_MESSAGE_LENGTH 
    ? rawMessage.substring(0, MAX_ERROR_MESSAGE_LENGTH) 
    : rawMessage;
  
  // Try to extract JSON error from wpFetch error format (parse once, reuse)
  let errorData = null;
  try {
    const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      errorData = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // JSON parsing failed, will fall back to original message
  }
  
  // Check for rate limit errors (429) - use already parsed data
  const rateLimitMatch = errorMessage.match(/WP error 429/i);
  if (rateLimitMatch) {
    // Try to extract retry-after from parsed JSON first
    if (errorData) {
      const retryAfter = errorData.retry_after || errorData.retryAfter || errorData.retry_after_seconds;
      
      if (retryAfter !== undefined && retryAfter !== null) {
        const seconds = parseInt(String(retryAfter), 10);
        const message = formatRetryAfterMessage(seconds);
        if (message) return message;
      }
    }
    
    // Fallback: Check for Retry-After in error message text
    const retryAfterMatch = errorMessage.match(/retry[_\s-]?after[:\s=]+(\d+)/i);
    if (retryAfterMatch) {
      const seconds = parseInt(retryAfterMatch[1], 10);
      const message = formatRetryAfterMessage(seconds);
      if (message) return message;
    }
    
    // Default rate limit message
    return "Rate limit exceeded. Please wait a moment and try again.";
  }
  
  // Return clean error message from JSON if available
  if (errorData) {
    return errorData.error || errorData.err || errorMessage;
  }
  
  return errorMessage;
}
