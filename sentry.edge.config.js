/**
 * Sentry Edge Configuration
 * Auto-initializes Sentry for edge runtime (Vercel Edge Functions, Middleware, etc.)
 * This file is automatically loaded by @sentry/nextjs
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://21fba8e29a3db74add9954b33763e4fd@o4510663441580032.ingest.us.sentry.io/4510663443939328",
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",
  tracesSampleRate: 0.1,
  enableLogs: true,
});

