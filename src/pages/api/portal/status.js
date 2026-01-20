import { createWpProxyHandler } from "../../../lib/api/wp-proxy";

/**
 * Proxy endpoint for portal status
 * GET /api/portal/status?estimateId=...&locationId=...&inviteToken=...
 * Proxies to: GET /ca/v1/portal/status
 */
export default createWpProxyHandler("/ca/v1/portal/status", {
  allowedMethods: ["GET"],
});
