/**
 * Generic WordPress API proxy utility.
 * Handles forwarding requests from Next.js to WordPress REST API.
 */

import { parse as parseCookie } from "cookie";

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8882";

/**
 * Get WordPress API base URL
 */
export function getWpBase() {
  return process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
}

/**
 * Create headers for WordPress API request
 */
export function createWpHeaders(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.ca_jwt || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  return {
    "Content-Type": "application/json",
    Cookie: req.headers.cookie ?? "",
    ...authHeader,
    ...devHeader,
  };
}

/**
 * Generic proxy handler for WordPress REST API endpoints.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {string} wpPath - WordPress API path (e.g., '/ca/v1/products')
 * @param {Object} options - Additional options
 * @param {string[]} options.allowedMethods - Allowed HTTP methods (default: ['GET', 'POST'])
 * @param {Function} options.transformRequest - Optional function to transform request body before sending
 * @param {Function} options.transformResponse - Optional function to transform response before returning
 * @param {Function} options.buildPath - Optional function to build the full path (for dynamic paths with query params)
 */
export async function proxyToWordPress(req, res, wpPath, options = {}) {
  const {
    allowedMethods = ["GET", "POST"],
    transformRequest = (body) => body,
    transformResponse = (body) => body,
    buildPath = null,
  } = options;

  // Check method
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  const wpBase = getWpBase();
  if (!wpBase) {
    return res.status(500).json({ ok: false, err: "WP API base not configured" });
  }

  try {
    const headers = createWpHeaders(req);
    const fetchOptions = {
      method: req.method,
      headers,
      credentials: "include",
    };

    // Build the full URL path (handle query strings)
    let finalPath = wpPath;
    if (buildPath) {
      finalPath = buildPath(wpPath, req);
    } else if (req.method === "GET" && req.query && Object.keys(req.query).length > 0) {
      // Auto-append query string for GET requests
      const params = new URLSearchParams();
      Object.entries(req.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        finalPath = `${wpPath}${wpPath.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    // Add body for POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(transformRequest(req.body));
    }

    const wpUrl = `${wpBase}${finalPath}`;
    const wpResp = await fetch(wpUrl, fetchOptions);
    const body = await wpResp.json();

    const transformedBody = transformResponse(body);
    return res.status(wpResp.status).json(transformedBody);
  } catch (e) {
    return res.status(500).json({
      ok: false,
      err: e instanceof Error ? e.message : "Failed to proxy request",
    });
  }
}

/**
 * Create a Next.js API route handler that proxies to WordPress.
 * 
 * @param {string|Function} wpPath - WordPress API path or function that returns path
 * @param {Object} options - Options (same as proxyToWordPress)
 * @returns {Function} Next.js API route handler
 */
export function createWpProxyHandler(wpPath, options = {}) {
  return async (req, res) => {
    // Handle dynamic paths (functions that take req and return path)
    const path = typeof wpPath === 'function' ? wpPath(req) : wpPath;
    
    // Handle validation
    if (options.validate) {
      const validation = options.validate(req);
      if (validation && !validation.valid) {
        return res.status(validation.status || 400).json({ 
          ok: false, 
          error: validation.error || 'Validation failed' 
        });
      }
    }
    
    return proxyToWordPress(req, res, path, options);
  };
}

