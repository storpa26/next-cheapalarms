import { createWpProxyHandler } from "../../../../lib/api/wp-proxy";

/**
 * Next.js API route that proxies bulk delete users requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler("/ca/v1/admin/users/bulk-delete", {
  allowedMethods: ["POST"],
});
