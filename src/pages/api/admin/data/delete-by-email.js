import { createWpProxyHandler } from "../../../../lib/api/wp-proxy";

/**
 * Next.js API route that proxies delete-by-email requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler(() => {
  return `/ca/v1/admin/data/delete-by-email`;
}, {
  allowedMethods: ["POST"],
});
