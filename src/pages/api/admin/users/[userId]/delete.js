import { createWpProxyHandler } from "../../../../lib/api/wp-proxy";

/**
 * Next.js API route that proxies delete user requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler((req) => {
  const { userId } = req.query;
  if (!userId || Array.isArray(userId)) {
    throw new Error("Invalid userId");
  }
  // Validate userId format (numeric or alphanumeric) to prevent path injection
  if (!/^[a-zA-Z0-9-]+$/.test(String(userId))) {
    throw new Error("Invalid userId format");
  }
  return `/ca/v1/admin/users/${encodeURIComponent(userId)}/delete`;
}, {
  allowedMethods: ["POST"],
});
