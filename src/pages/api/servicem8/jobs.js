/**
 * ServiceM8 Jobs API endpoints
 * GET /api/servicem8/jobs - List jobs
 * POST /api/servicem8/jobs - Create a new job
 */
export default async function handler(req, res) {
  try {
    if (!process.env.SERVICEM8_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Missing SERVICEM8_API_KEY in environment",
      });
    }

    const { servicem8Fetch } = await import("../../../lib/servicem8");

    if (req.method === "GET") {
      // Get jobs (with optional filters)
      const { uuid, company_uuid, status } = req.query;
      let endpoint = "/job.json";

      // Build query params if provided
      const params = new URLSearchParams();
      if (uuid) params.append("uuid", uuid);
      if (company_uuid) params.append("company_uuid", company_uuid);
      if (status) params.append("status", status);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const jobs = await servicem8Fetch(endpoint, { method: "GET" });

      return res.status(200).json({
        ok: true,
        jobs: Array.isArray(jobs) ? jobs : [jobs],
        count: Array.isArray(jobs) ? jobs.length : 1,
      });
    }

    if (req.method === "POST") {
      // Create a new job
      const {
        company_uuid,
        job_type_uuid,
        assigned_to_staff_uuid,
        scheduled_start_date,
        scheduled_end_date,
        description,
        address,
        ...otherFields
      } = req.body;

      if (!company_uuid) {
        return res.status(400).json({
          ok: false,
          error: "company_uuid is required",
        });
      }

      const jobData = {
        company_uuid,
        ...(job_type_uuid && { job_type_uuid }),
        ...(assigned_to_staff_uuid && { assigned_to_staff_uuid }),
        ...(scheduled_start_date && { scheduled_start_date }),
        ...(scheduled_end_date && { scheduled_end_date }),
        ...(description && { description }),
        ...(address && { address }),
        ...otherFields,
      };

      const job = await servicem8Fetch("/job.json", {
        method: "POST",
        body: jobData,
      });

      return res.status(200).json({
        ok: true,
        job,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    const raw = e && (e.data || e.message || e.toString?.());
    const error =
      typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
    return res.status(e.status || 500).json({ ok: false, error });
  }
}

