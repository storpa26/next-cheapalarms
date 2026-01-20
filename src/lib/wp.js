/**
 * CLIENT-SAFE WordPress utilities
 * 
 * ⚠️ This file only exports constants and utilities safe for client-side use.
 * DO NOT add functions that make direct WordPress API calls here.
 * 
 * For client-side API calls, use:
 * - apiFetch() from lib/api/apiFetch.js to call Next.js API routes (/api/*)
 * 
 * For server-side WordPress calls, use:
 * - wp.server.js (API routes, SSR, getServerSideProps)
 */

/**
 * Token cookie name
 * Safe to export for use in login/logout API routes
 */
export const TOKEN_COOKIE = "ca_jwt";

