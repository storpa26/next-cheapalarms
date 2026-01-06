/**
 * Request ID utilities
 * Handles extraction and display of request IDs for error correlation
 */

// UUID v4 regex pattern
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Alphanumeric request ID pattern (8-128 characters, allows hyphens and underscores)
const ALPHANUMERIC_ID_REGEX = /^[a-zA-Z0-9_-]{8,128}$/;

/**
 * Validate request ID format
 * Accepts UUID v4 or alphanumeric IDs (8-128 chars)
 * @param {string} requestId - Request ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidRequestId(requestId) {
  if (!requestId || typeof requestId !== 'string') {
    return false;
  }
  
  // Trim whitespace
  const trimmed = requestId.trim();
  
  // Check UUID v4 format
  if (UUID_V4_REGEX.test(trimmed)) {
    return true;
  }
  
  // Check alphanumeric format (8-128 chars)
  if (ALPHANUMERIC_ID_REGEX.test(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Extract request ID from response headers
 * @param {Response} response - Fetch Response object
 * @returns {string|null} Request ID if found and valid, null otherwise
 */
export function getRequestIdFromResponse(response) {
  if (!response || !response.headers) {
    return null;
  }

  // Check X-Request-ID header (standard)
  const requestId = response.headers.get('X-Request-ID') || 
                    response.headers.get('x-request-id') ||
                    response.headers.get('X-Correlation-ID') ||
                    response.headers.get('x-correlation-id');

  // Validate format before returning
  if (requestId && isValidRequestId(requestId)) {
    return requestId.trim();
  }

  return null;
}

/**
 * Extract request ID from error object
 * @param {Error|Response|any} error - Error object
 * @returns {string|null} Request ID if found and valid, null otherwise
 */
export function getRequestIdFromError(error) {
  if (!error) {
    return null;
  }

  // Check if it's a Response object
  if (error instanceof Response) {
    return getRequestIdFromResponse(error);
  }

  // Check if error has requestId property (validate it)
  if (error.requestId && isValidRequestId(error.requestId)) {
    return String(error.requestId).trim();
  }

  // Check if error has headers (from fetch)
  if (error.headers) {
    return getRequestIdFromResponse({ headers: error.headers });
  }

  return null;
}

/**
 * Format error message with request ID for display
 * @param {string} message - Error message
 * @param {string|null} requestId - Request ID
 * @param {boolean} showInProduction - Whether to show request ID in production
 * @returns {string} Formatted message with request ID
 */
export function formatErrorWithRequestId(message, requestId, showInProduction = false) {
  if (!requestId) {
    return message;
  }

  // In production, only show if explicitly requested
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return message;
  }

  return `${message}\n\nRequest ID: ${requestId}`;
}

/**
 * Create a request ID display component text
 * @param {string|null} requestId - Request ID
 * @returns {string} Formatted request ID text for display
 */
export function formatRequestIdForDisplay(requestId) {
  if (!requestId) {
    return null;
  }

  return `Request ID: ${requestId}`;
}

