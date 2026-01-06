/**
 * Sentry initialization for Next.js
 * 
 * Note: This requires @sentry/nextjs to be installed:
 * npm install @sentry/nextjs
 * 
 * Configure via environment variables:
 * - NEXT_PUBLIC_SENTRY_DSN: Your Sentry DSN
 * - SENTRY_ENVIRONMENT: Environment name (development, staging, production)
 */

let Sentry = null;
let SentryLoading = false;
let SentryLoadPromise = null;
const errorQueue = []; // Queue for errors that occur before Sentry loads

/**
 * Load Sentry module (server-side only)
 */
function loadSentryServer() {
  if (Sentry !== null) {
    return Sentry;
  }

  try {
    // Use a pattern that webpack can't statically analyze
    // eslint-disable-next-line no-eval
    const sentryModule = eval('require')('@sentry/nextjs');
    Sentry = sentryModule.default || sentryModule;
    return Sentry;
  } catch (e) {
    Sentry = null;
    return null;
  }
}

/**
 * Load Sentry module (client-side)
 */
async function loadSentryClient() {
  if (Sentry !== null) {
    return Sentry;
  }

  if (SentryLoading) {
    // Already loading, wait for it
    return SentryLoadPromise;
  }

  SentryLoading = true;
  SentryLoadPromise = (async () => {
    try {
      // Use dynamic import with constructed module name to prevent Turbopack from analyzing it
      // This prevents build-time warnings when @sentry/nextjs is not installed
      // Use a pattern that can't be statically analyzed by the bundler
      // Split the module name across multiple operations to prevent static analysis
      const parts = ['@', 'sentry', '/', 'nextjs'];
      const moduleName = parts.reduce((acc, part) => acc + part, '');
      // Use Function constructor to create a truly dynamic import that can't be analyzed
      const dynamicImport = new Function('moduleName', 'return import(moduleName)');
      const sentryModule = await dynamicImport(moduleName);
      Sentry = sentryModule.default || sentryModule;
      
      // Process queued errors
      if (errorQueue.length > 0) {
        const queue = [...errorQueue];
        errorQueue.length = 0; // Clear queue
        queue.forEach(({ error, context }) => {
          captureException(error, context);
        });
      }
      
      return Sentry;
    } catch (e) {
      Sentry = null;
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Sentry] SDK not installed. Install via: npm install @sentry/nextjs');
      }
      return null;
    } finally {
      SentryLoading = false;
    }
  })();

  return SentryLoadPromise;
}

// Try to load on server-side immediately
if (typeof window === 'undefined') {
  loadSentryServer();
  if (!Sentry && process.env.NODE_ENV === 'development') {
    console.warn('[Sentry] SDK not installed. Install via: npm install @sentry/nextjs');
  }
}

/**
 * Get Sentry instance (loads if needed)
 */
async function getSentry() {
  if (typeof window === 'undefined') {
    return loadSentryServer();
  } else {
    return await loadSentryClient();
  }
}

/**
 * Initialize Sentry if DSN is configured
 */
export async function initSentry() {
  // Check if already initialized (prevent double initialization)
  if (typeof window !== 'undefined' && window.__SENTRY_INITIALIZED__) {
    return;
  }

  const sentry = await getSentry();
  if (!sentry) {
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return; // Sentry not configured
  }

  try {
    sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          event.request = filterSensitiveData(event.request);
        }
        if (event.extra) {
          event.extra = filterSensitiveData(event.extra);
        }
        return event;
      },
    });
    
    // Mark as initialized to prevent double initialization
    if (typeof window !== 'undefined') {
      window.__SENTRY_INITIALIZED__ = true;
    }
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
}

/**
 * Filter sensitive data from Sentry events
 */
function filterSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitive = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'api_key', 'email', 'phone'];
  const filtered = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitive.some(s => keyLower.includes(s));

    if (isSensitive) {
      filtered[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Capture exception (handles async loading)
 */
export function captureException(error, context = null) {
  // If Sentry is already loaded, use it immediately
  if (Sentry) {
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
      console.error('[Sentry] Failed to capture exception:', e);
    }
    return;
  }

  // If on client-side and not loaded yet, queue the error
  if (typeof window !== 'undefined') {
    errorQueue.push({ error, context });
    // Try to load Sentry in background
    getSentry().catch(() => {
      // Silently fail
    });
  }
  // Server-side: if not loaded, silently skip (can't queue on server)
}

/**
 * Set user context (handles async loading)
 */
export async function setUser(userId, email = null, metadata = null) {
  const sentry = await getSentry();
  if (!sentry) {
    return;
  }

  try {
    sentry.setUser({
      id: userId,
      email,
      ...metadata,
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Set request ID context (handles async loading)
 */
export async function setRequestId(requestId) {
  const sentry = await getSentry();
  if (!sentry) {
    return;
  }

  try {
    sentry.setTag('request_id', requestId);
    sentry.setContext('request', { id: requestId });
  } catch (e) {
    // Silently fail
  }
}

export default Sentry;
