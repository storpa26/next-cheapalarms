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

  const { uuid } = req.query;
  if (!uuid) {
    return res.status(400).json({ ok: false, error: "Staff UUID is required" });
  }

  try {
    const url = `${wpBase}/ca/v1/servicem8/staff/${encodeURIComponent(uuid)}`;

    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie ?? "",
        ...authHeader,
        ...devHeader,
      },
      credentials: "include",
    });
    const body = await resp.json();
    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
  }
}

