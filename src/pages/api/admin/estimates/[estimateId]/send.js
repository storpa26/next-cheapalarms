import { createWpProxyHandler } from "@/lib/api/wp-proxy";

/**
 * Next.js API route that proxies send estimate requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler((req) => {
  const { estimateId } = req.query;
  if (!estimateId || Array.isArray(estimateId)) {
    throw new Error("Invalid estimateId");
  }
  // Validate estimateId format (alphanumeric and hyphens only) to prevent path injection
  if (!/^[a-zA-Z0-9-]+$/.test(estimateId)) {
    throw new Error("Invalid estimateId format");
  }
  return `/ca/v1/admin/estimates/${encodeURIComponent(estimateId)}/send`;
}, {
  allowedMethods: ["POST"],
});
