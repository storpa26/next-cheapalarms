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

  if (req.method === "GET") {
    try {
      const resp = await fetch(`${wpBase}/ca/v1/ghl/contacts`, {
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

  if (req.method === "POST") {
    try {
      const resp = await fetch(`${wpBase}/ca/v1/ghl/contacts`, {
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

      // Handle non-JSON responses
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await resp.text();
        return res.status(resp.status).json({ 
          ok: false, 
          error: `WordPress returned non-JSON response: ${text.substring(0, 200)}` 
        });
      }

      const body = await resp.json();
      return res.status(resp.status).json(body);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      // Provide more context for fetch failures
      if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ENOTFOUND")) {
        return res.status(500).json({ 
          ok: false, 
          error: `Cannot connect to WordPress at ${wpBase}. Error: ${errorMessage}. Please ensure WordPress is running and NEXT_PUBLIC_WP_URL is set correctly.` 
        });
      }
      return res.status(500).json({ ok: false, error: errorMessage });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
