import { proxyToWordPress } from "@/lib/api/wp-proxy";

/**
 * Get Xero Authorization URL
 * 
 * This endpoint proxies to WordPress to get the Xero OAuth authorization URL.
 * The frontend can call this to redirect users to Xero's authorization page.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/xero/authorize", {
    method: "GET",
  });
}

