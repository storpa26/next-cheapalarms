import { WP_API_BASE } from "../../../lib/wp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  try {
    const payload = req.body ?? {};

    const resp = await fetch(`${wpBase}/ca/v1/portal/request-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...devHeader,
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
        ...(req.headers['x-wp-nonce'] && { 'X-WP-Nonce': req.headers['x-wp-nonce'] }),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    let body;
    try {
      const text = await resp.text();
      if (!text) {
        return res.status(500).json({ ok: false, error: "Empty response from WordPress API" });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to parse response from WordPress API",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
      });
    }

    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
  }
}

