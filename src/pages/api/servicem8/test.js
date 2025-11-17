/**
 * Test endpoint to verify ServiceM8 API connection
 * GET /api/servicem8/test - Check if API key is configured
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  try {
    if (!process.env.SERVICEM8_API_KEY) {
      return res.status(200).json({
        ok: false,
        hasKey: false,
        message: "SERVICEM8_API_KEY not configured",
      });
    }

    // Test API connection by fetching companies (lightweight endpoint)
    const { servicem8Fetch } = await import("../../../lib/servicem8");
    
    try {
      const companies = await servicem8Fetch("/company.json", {
        method: "GET",
      });

      return res.status(200).json({
        ok: true,
        hasKey: true,
        message: "ServiceM8 API connection successful",
        testData: {
          companiesCount: Array.isArray(companies) ? companies.length : 0,
          sample: Array.isArray(companies) && companies.length > 0 ? companies[0] : null,
        },
      });
    } catch (apiError) {
      return res.status(200).json({
        ok: false,
        hasKey: true,
        message: "API key configured but connection failed",
        error: apiError.message || "Unknown error",
        status: apiError.status,
        data: apiError.data,
      });
    }
  } catch (e) {
    const raw = e && (e.data || e.message || e.toString?.());
    const error =
      typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
    return res.status(e.status || 500).json({ ok: false, error });
  }
}

