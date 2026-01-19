import { createWpProxyHandler } from "../../../../../../lib/api/wp-proxy";

/**
 * Next.js API route that proxies delete GHL contact requests to WordPress.
 * This route runs server-side and can read httpOnly cookies to authenticate requests.
 */
export default createWpProxyHandler((req) => {
  const { contactId } = req.query;
  if (!contactId || Array.isArray(contactId)) {
    throw new Error("Invalid contactId");
  }
  // Validate contactId format (alphanumeric and hyphens only) to prevent path injection
  if (!/^[a-zA-Z0-9-]+$/.test(contactId)) {
    throw new Error("Invalid contactId format");
  }
  return `/ca/v1/admin/ghl/contacts/${encodeURIComponent(contactId)}/delete`;
}, {
  allowedMethods: ["POST"],
});
