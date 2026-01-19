import { proxyToWordPress } from "../../../lib/api/wp-proxy";

/**
 * Get Client Secret for Payment Intent
 * 
 * Retrieves the client secret for an existing payment intent.
 * Used when reusing payment intents.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { paymentIntentId } = req.query;

  if (!paymentIntentId) {
    return res.status(400).json({ ok: false, error: "paymentIntentId is required" });
  }

  return proxyToWordPress(req, res, `/ca/v1/stripe/get-client-secret?paymentIntentId=${encodeURIComponent(paymentIntentId)}`, {
    method: "GET",
  });
}
