import { WP_API_BASE } from "@/lib/wp";
import { parse as parseCookie } from "cookie";

export default async function handler(req, res) {
  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.ca_jwt || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  if (req.method === "POST") {
    try {
      const url = `${wpBase}/ca/v1/servicem8/jobs/create-from-estimate`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.cookie ?? "",
          ...authHeader,
          ...devHeader,
        },
        credentials: "include",
        body: JSON.stringify(req.body ?? {}),
      });
      const body = await resp.json();
      return res.status(resp.status).json(body);
    } catch (e) {
      return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
    }
  }

  res.setHeader("Allow", "POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

