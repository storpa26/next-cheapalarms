import { createWpProxyHandler } from "../../../../lib/api/wp-proxy";

/**
 * Proxy endpoint for updating estimate (admin)
 * PUT /api/admin/estimate/update
 * Proxies to: PUT /ca/v1/estimate/update
 */
export default createWpProxyHandler("/ca/v1/estimate/update", {
  allowedMethods: ["PUT", "PATCH"],
});
