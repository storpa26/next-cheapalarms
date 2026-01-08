/**
 * Sentry Utility Functions
 * 
 * Note: Sentry is automatically initialized via:
 * - sentry.client.config.js (client-side)
 * - sentry.server.config.js (server-side)
 * - sentry.edge.config.js (edge runtime)
 * 
 * This file provides convenience functions for common Sentry operations.
 * All functions now use direct imports from @sentry/nextjs (no dynamic loading needed).
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Get Sentry logger instance
 * Usage: const { logger } = getLogger();
 */
export function getLogger() {
  return Sentry.logger;
}

/**
 * Capture exception (wrapper for convenience)
 * Preserves existing API for backward compatibility
 */
export function captureException(error, context = null) {
  try {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (e) {
    console.error("[Sentry] Failed to capture exception:", e);
  }
}

/**
 * Capture message
 */
export function captureMessage(message, level = "info") {
  try {
    Sentry.captureMessage(message, level);
  } catch (e) {
    console.error("[Sentry] Failed to capture message:", e);
  }
}

/**
 * Set user context
 * Preserves existing API for backward compatibility
 */
export function setUser(userId, email = null, metadata = null) {
  try {
    Sentry.setUser({
      id: userId,
      email,
      ...metadata,
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Set request ID context
 * Preserves existing API for backward compatibility
 */
export function setRequestId(requestId) {
  try {
    Sentry.setTag("request_id", requestId);
    Sentry.setContext("request", { id: requestId });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Create a span for tracing
 * Usage: startSpan({ op: "ui.click", name: "Button Click" }, (span) => { ... })
 */
export function startSpan(options, callback) {
  return Sentry.startSpan(options, callback);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb) {
  try {
    Sentry.addBreadcrumb(breadcrumb);
  } catch (e) {
    // Silently fail
  }
}

/**
 * Set context
 */
export function setContext(name, context) {
  try {
    Sentry.setContext(name, context);
  } catch (e) {
    // Silently fail
  }
}

/**
 * Set tag
 */
export function setTag(key, value) {
  try {
    Sentry.setTag(key, value);
  } catch (e) {
    // Silently fail
  }
}

// Re-export Sentry for direct access if needed
export default Sentry;
