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

