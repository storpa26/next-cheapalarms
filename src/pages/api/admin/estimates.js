import { createWpProxyHandler } from "@/lib/api/wp-proxy";

/**
 * Next.js API route that proxies admin estimates requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler("/ca/v1/admin/estimates", {
  allowedMethods: ["GET"],
});
