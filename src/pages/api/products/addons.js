import { WP_API_BASE } from "@/lib/wp";
import { parse as parseCookie } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }
  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.ca_jwt || null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};
  try {
    const resp = await fetch(`${wpBase}/ca/v1/products/addons`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie ?? "",
        ...authHeader,
        ...devHeader,
      },
      credentials: "include",
    });
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, err: e instanceof Error ? e.message : "Failed" });
  }
}


