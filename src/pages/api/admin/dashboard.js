import { getDashboardData } from "@/lib/admin/services/dashboard-data";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  try {
    const data = await getDashboardData(req);
    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Map wpFetch error format: "WP error ${status} ${statusText}: ${body}"
    if (typeof message === "string") {
      if (message.startsWith("WP error 401")) {
        return res.status(401).json({ ok: false, err: "Not authenticated" });
      }
      if (message.startsWith("WP error 403")) {
        return res.status(403).json({ ok: false, err: "Forbidden" });
      }
    }

    return res.status(500).json({ ok: false, err: message });
  }
}


