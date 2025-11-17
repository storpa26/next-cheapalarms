/**
 * ServiceM8 Single Job API endpoints
 * GET /api/servicem8/jobs/[uuid] - Get a specific job
 * DELETE /api/servicem8/jobs/[uuid] - Delete a job
 */
export default async function handler(req, res) {
  try {
    if (!process.env.SERVICEM8_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Missing SERVICEM8_API_KEY in environment",
      });
    }

    const { uuid } = req.query;
    if (!uuid) {
      return res.status(400).json({
        ok: false,
        error: "Job UUID is required",
      });
    }

    const { servicem8Fetch } = await import("../../../../lib/servicem8");

    if (req.method === "GET") {
      const job = await servicem8Fetch(`/job/${uuid}.json`, { method: "GET" });

      return res.status(200).json({
        ok: true,
        job,
      });
    }

    if (req.method === "DELETE") {
      await servicem8Fetch(`/job/${uuid}.json`, { method: "DELETE" });

      return res.status(200).json({
        ok: true,
        message: "Job deleted successfully",
      });
    }

    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).end();
  } catch (e) {
    const raw = e && (e.data || e.message || e.toString?.());
    const error =
      typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
    return res.status(e.status || 500).json({ ok: false, error });
  }
}

