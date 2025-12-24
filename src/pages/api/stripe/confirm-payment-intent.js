import { proxyToWordPress } from "@/lib/api/wp-proxy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return proxyToWordPress(req, res, "/ca/v1/stripe/confirm-payment-intent", {
    method: "POST",
  });
}

