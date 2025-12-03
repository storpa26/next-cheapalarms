/**
 * User-friendly error messages for common HTTP status codes and error scenarios
 */

export const ERROR_MESSAGES = {
  // Authentication & Authorization
  401: "Your session has expired. Please refresh the page and log in again.",
  403: "You don't have permission to do that. Please ensure you're logged in with the correct account.",
  
  // Client Errors
  400: "Invalid request. Please check your input and try again.",
  404: "The requested resource could not be found.",
  409: "This operation cannot be completed because of a conflict. Please refresh and try again.",
  413: "The file is too large. Maximum size is 10MB.",
  415: "This file type is not supported. Please use JPG, PNG, GIF, or WEBP.",
  422: "The data provided is invalid. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
  
  // Server Errors
  500: "A server error occurred. Please try again in a moment.",
  502: "Service temporarily unavailable. Please try again shortly.",
  503: "Service temporarily unavailable. Please try again shortly.",
  504: "The request timed out. Please check your connection and try again.",
  
  // Network Errors
  network: "Connection lost. Please check your internet connection and try again.",
  timeout: "The request timed out. Please try again.",
  
  // Upload Specific
  upload_failed: "Failed to upload file. Please check your connection and try again.",
  upload_session_failed: "Failed to start upload session. Please try again.",
  
  // Generic
  unknown: "An unexpected error occurred. Please try again.",
};

/**
 * Get a user-friendly error message for an HTTP status code or error type
 * @param {number|string} statusOrType - HTTP status code or error type
 * @param {string} fallback - Fallback message if no match found
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(statusOrType, fallback = ERROR_MESSAGES.unknown) {
  if (typeof statusOrType === 'number' && ERROR_MESSAGES[statusOrType]) {
    return ERROR_MESSAGES[statusOrType];
  }
  
  if (typeof statusOrType === 'string' && ERROR_MESSAGES[statusOrType]) {
    return ERROR_MESSAGES[statusOrType];
  }
  
  return fallback;
}

/**
 * Parse error from fetch response or Error object
 * @param {Response|Error|any} error - Error to parse
 * @returns {Promise<{status: number|string, message: string, details: any}>}
 */
export async function parseError(error) {
  // Handle Response objects (from fetch)
  if (error instanceof Response) {
    const status = error.status;
    let details = null;
    
    try {
      const json = await error.json();
      details = json.error || json.err || json.message;
    } catch (e) {
      // Response body isn't JSON
      details = await error.text().catch(() => null);
    }
    
    return {
      status,
      message: getErrorMessage(status),
      details,
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message || '';
    
    // Check for network errors
    if (message.toLowerCase().includes('network') || 
        message.toLowerCase().includes('failed to fetch')) {
      return {
        status: 'network',
        message: ERROR_MESSAGES.network,
        details: message,
      };
    }
    
    // Check for timeout errors
    if (message.toLowerCase().includes('timeout')) {
      return {
        status: 'timeout',
        message: ERROR_MESSAGES.timeout,
        details: message,
      };
    }
    
    return {
      status: 'unknown',
      message: ERROR_MESSAGES.unknown,
      details: message,
    };
  }
  
  // Handle plain objects with status
  if (error && typeof error === 'object' && error.status) {
    return {
      status: error.status,
      message: getErrorMessage(error.status),
      details: error.error || error.message,
    };
  }
  
  // Unknown error type
  return {
    status: 'unknown',
    message: ERROR_MESSAGES.unknown,
    details: error,
  };
}

/**
 * Format error message with optional details for display
 * @param {string} message - Main error message
 * @param {string} [details] - Optional details (shown in dev mode)
 * @returns {string} Formatted message
 */
export function formatErrorMessage(message, details = null) {
  if (!details || process.env.NODE_ENV === 'production') {
    return message;
  }
  
  return `${message}${details ? `\n\nDetails: ${details}` : ''}`;
}

