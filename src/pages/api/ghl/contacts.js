export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      hasKey: Boolean(process.env.GHL_API_KEY),
      hasLocationId: Boolean(process.env.GHL_LOCATION_ID),
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  }
  try {
    if (!process.env.GHL_API_KEY) {
      return res
        .status(500)
        .json({ ok: false, error: "Missing GHL_API_KEY in environment" });
    }
    if (!process.env.GHL_LOCATION_ID) {
      return res
        .status(500)
        .json({ ok: false, error: "Missing GHL_LOCATION_ID in environment" });
    }
    const { email, phone, firstName, lastName } = req.body || {};
    if (!email && !phone) {
      return res.status(400).json({ ok: false, error: "email or phone required" });
    }
    const payload = {
      email,
      phone,
      firstName,
      lastName,
      locationId: process.env.GHL_LOCATION_ID,
    };
    const resp = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    if (!resp.ok) {
      const details =
        (json && (json.error || json.message)) || text || `HTTP ${resp.status}`;
      return res.status(resp.status).json({ ok: false, error: details });
    }
    return res.status(200).json({ ok: true, contact: json });
  } catch (e) {
    const raw = e && (e.data || e.message || e.toString?.());
    const error =
      typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
    return res.status(e.status || 500).json({ ok: false, error });
  }
}


