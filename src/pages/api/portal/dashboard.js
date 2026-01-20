import { createWpProxyHandler } from "../../../lib/api/wp-proxy";

/**
 * Proxy endpoint for portal dashboard
 * GET /api/portal/dashboard
 * Proxies to: GET /ca/v1/portal/dashboard
 */
export default createWpProxyHandler("/ca/v1/portal/dashboard", {
  allowedMethods: ["GET"],
});
