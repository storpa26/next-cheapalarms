import { createWpProxyHandler } from "@/lib/api/wp-proxy";

/**
 * Public quote request endpoint
 * Proxies to WordPress /ca/v1/quote-request
 * No authentication required - this is a public endpoint
 */
export default createWpProxyHandler("/ca/v1/quote-request", {
  allowedMethods: ["POST"],
});

