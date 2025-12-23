import { proxyToWordPress } from "@/lib/api/wp-proxy";

/**
 * Disconnect Xero
 * 
 * Remove Xero authorization and clear stored tokens.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/xero/disconnect", {
    method: "POST",
  });
}

