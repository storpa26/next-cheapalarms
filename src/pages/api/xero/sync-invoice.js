import { proxyToWordPress } from "../../../lib/api/wp-proxy";

/**
 * Sync Invoice to Xero
 * 
 * Create or update an invoice in Xero from a GHL invoice.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/xero/sync-invoice", {
    method: "POST",
  });
}

