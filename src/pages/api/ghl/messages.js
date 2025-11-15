export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  try {
    if (!process.env.GHL_API_KEY) {
      return res
        .status(500)
        .json({ ok: false, error: "Missing GHL_API_KEY in environment" });
    }
    const { contactId, subject, html, text, fromEmail } = req.body || {};

    if (!contactId) {
      return res.status(400).json({ ok: false, error: "contactId required" });
    }
    if (!subject) {
      return res.status(400).json({ ok: false, error: "subject required" });
    }
    if (!html && !text) {
      return res
        .status(400)
        .json({ ok: false, error: "Provide html or text content" });
    }

    const effectiveFromEmail = fromEmail || process.env.GHL_FROM_EMAIL || "quotes@cheapalarms.dev";

    const payload = {
      contactId,
      type: "Email",
      status: "pending",
      subject,
      html: html || undefined,
      message: text || undefined,
      emailFrom: effectiveFromEmail,
      locationId: process.env.GHL_LOCATION_ID || undefined,
    };

    const { ghlFetch } = await import("../../../lib/ghl");
    const result = await ghlFetch("/conversations/messages", {
      method: "POST",
      body: payload,
      includeLocationHeader: true,
    });
    return res.status(200).json({ ok: true, message: result });
  } catch (e) {
    const raw = e && (e.data || e.message || e.toString?.());
    const error =
      typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
    return res.status(e.status || 500).json({ ok: false, error });
  }
}


