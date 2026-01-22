import { proxyToWordPress } from "../../../lib/api/wp-proxy";

/**
 * Sync a payment to Xero (record payment against an existing Xero invoice).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/xero/sync-payment", {
    method: "POST",
  });
}
