/**
 * Next.js Instrumentation Hook
 * This file is automatically loaded by Next.js to register Sentry
 * Required for Next.js 13+ App Router and recommended for Pages Router
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config.js");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config.js");
  }
}

