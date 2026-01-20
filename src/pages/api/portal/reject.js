import { getWpBase } from "../../../lib/api/wp-proxy";
import { createWpHeaders } from "../../../lib/api/wp-proxy";

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
    // Use createWpHeaders for consistent JWT token extraction and cookie handling
    const headers = createWpHeaders(req);

    const resp = await fetch(`${wpBase}/ca/v1/portal/reject`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(req.body ?? {}),
    });
    const body = await resp.json();
    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, err: e instanceof Error ? e.message : "Failed" });
  }
}

