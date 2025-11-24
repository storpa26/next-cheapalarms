/**
 * Request utilities for admin pages
 */

/**
 * Extracts cookie header from Next.js request object
 * @param {object} req - Next.js request object
 * @returns {object} Headers object with Cookie header
 */
export function cookieHeader(req) {
  const cookie = req?.headers?.cookie;
  return cookie ? { Cookie: cookie } : {};
}

/**
 * Builds authentication headers for WordPress API requests
 * @param {object} req - Next.js request object
 * @returns {object} Headers object with auth headers
 */
export function buildAuthHeaders(req) {
  const cookies = cookieHeader(req);
  const token = req?.headers?.cookie?.match(/ca_jwt=([^;]+)/)?.[1] || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  return {
    ...cookies,
    ...authHeader,
    ...devHeader,
  };
}

