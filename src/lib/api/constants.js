/**
 * API configuration constants
 */

// Timeout constants (in milliseconds)
export const API_TIMEOUT = 15000; // 15 seconds - for general API calls
export const AUTH_TIMEOUT = 10000; // 10 seconds - for authentication checks

// Rate limiting constants (for future use)
export const RATE_LIMIT_AUTH = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
};

export const RATE_LIMIT_PASSWORD_RESET = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
};

export const RATE_LIMIT_PORTAL = {
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
};

export const RATE_LIMIT_UPLOAD = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
};
