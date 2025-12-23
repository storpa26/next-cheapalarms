import { proxyToWordPress } from "@/lib/api/wp-proxy";

/**
 * Get Xero Connection Status
 * 
 * Check if Xero is connected and authorized.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/xero/status", {
    method: "GET",
  });
}

