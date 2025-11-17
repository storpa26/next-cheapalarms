import { WP_API_BASE } from "@/lib/wp";
import { parse as parseCookie } from "cookie";

export default async function handler(req, res) {
  const { uuid } = req.query;
  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  if (!uuid) {
    return res.status(400).json({ ok: false, error: "Job UUID is required" });
  }

  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.ca_jwt || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  if (req.method === "GET") {
    try {
      const resp = await fetch(`${wpBase}/ca/v1/servicem8/jobs/${encodeURIComponent(uuid)}`, {
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

  if (req.method === "DELETE") {
    try {
      const resp = await fetch(`${wpBase}/ca/v1/servicem8/jobs/${encodeURIComponent(uuid)}`, {
        method: "DELETE",
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

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
