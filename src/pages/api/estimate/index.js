import { WP_API_BASE } from "@/lib/wp";
import { parse as parseCookie } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.ca_jwt || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  try {
    const { estimateId, locationId, inviteToken } = req.query;
    if (!estimateId) {
      return res.status(400).json({ ok: false, error: "estimateId required" });
    }

    const params = new URLSearchParams();
    params.set("estimateId", estimateId);
    if (locationId) params.set("locationId", locationId);
    if (inviteToken) params.set("inviteToken", inviteToken);

    const resp = await fetch(`${wpBase}/ca/v1/estimate?${params.toString()}`, {
      method: "GET",
      headers: {
        Cookie: req.headers.cookie ?? "",
        ...authHeader,
        ...devHeader,
      },
      credentials: "include",
    });

    const body = await resp.json();
    
    // Set cache headers for GET requests (helps with browser caching)
    // Use "private" since these are authenticated responses
    res.setHeader("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    res.setHeader("Vary", "Authorization, Cookie");
    
    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
  }
}

