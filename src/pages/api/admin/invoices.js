import { createWpProxyHandler } from "@/lib/api/wp-proxy";

/**
 * Next.js API route that proxies admin invoices requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler("/ca/v1/admin/invoices", {
  allowedMethods: ["GET"],
});
