/**
 * ServiceM8 Companies API endpoints
 * GET /api/servicem8/companies - List companies (clients)
 * POST /api/servicem8/companies - Create a new company
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
      const { uuid, name } = req.query;
      let endpoint = "/company.json";

      const params = new URLSearchParams();
      if (uuid) params.append("uuid", uuid);
      if (name) params.append("name", name);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const companies = await servicem8Fetch(endpoint, { method: "GET" });

      return res.status(200).json({
        ok: true,
        companies: Array.isArray(companies) ? companies : [companies],
        count: Array.isArray(companies) ? companies.length : 1,
      });
    }

    if (req.method === "POST") {
      // Create a new company
      const {
        name,
        email,
        phone,
        address,
        city,
        state,
        postcode,
        country,
        ...otherFields
      } = req.body;

      if (!name) {
        return res.status(400).json({
          ok: false,
          error: "Company name is required",
        });
      }

      const companyData = {
        name,
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postcode && { postcode }),
        ...(country && { country }),
        ...otherFields,
      };

      const company = await servicem8Fetch("/company.json", {
        method: "POST",
        body: companyData,
      });

      return res.status(200).json({
        ok: true,
        company,
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

