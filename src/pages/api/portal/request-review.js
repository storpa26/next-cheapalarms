import { getWpBase, createWpHeaders, parseWpResponse } from "../../../lib/api/wp-proxy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = getWpBase();
  if (!wpBase) {
    return res.status(500).json({ ok: false, err: "WP API base not configured" });
  }

  try {
    const payload = req.body ?? {};

    // Use createWpHeaders for consistent JWT token extraction and cookie handling
    // This also handles X-WP-Nonce header automatically
    const headers = createWpHeaders(req);

    const resp = await fetch(`${wpBase}/ca/v1/portal/request-review`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const { body, status } = await parseWpResponse(resp);
    return res.status(status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, err: e instanceof Error ? e.message : "Failed" });
  }
}

