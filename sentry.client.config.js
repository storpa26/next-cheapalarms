/**
 * Sentry Client Configuration
 * Auto-initializes Sentry for client-side (browser) code
 * This file is automatically loaded by @sentry/nextjs
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://21fba8e29a3db74add9954b33763e4fd@o4510663441580032.ingest.us.sentry.io/4510663443939328",
  
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // Set to true only when actively debugging Sentry issues
  debug: false,
  
  // Enable logs
  enableLogs: true,
  
  // Replay can be used to capture user sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request) {
      event.request = filterSensitiveData(event.request);
    }
    if (event.extra) {
      event.extra = filterSensitiveData(event.extra);
    }
    if (event.user) {
      // Preserve user ID but redact email/other PII if needed
      // event.user.email = "[REDACTED]"; // Uncomment if you want to redact emails
    }
    return event;
  },
});

/**
 * Filter sensitive data from Sentry events
 * Preserves existing filtering logic from src/lib/sentry.js
 */
function filterSensitiveData(data) {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sensitive = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "api_key",
    "email",
    "phone",
  ];
  const filtered = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitive.some((s) => keyLower.includes(s));

    if (isSensitive) {
      filtered[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

