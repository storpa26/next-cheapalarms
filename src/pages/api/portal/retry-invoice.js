import { getWpBase } from "../../../lib/api/wp-proxy";
import { createWpHeaders } from "../../../lib/api/wp-proxy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = getWpBase();
  if (!wpBase) {
    return res.status(500).json({ ok: false, err: "WP API base not configured" });
  }

  try {
    const payload = req.body ?? {};
    const { estimateId, locationId, inviteToken } = payload;

    if (!estimateId) {
      return res.status(400).json({ ok: false, err: "estimateId is required" });
    }

    // Use createWpHeaders for consistent JWT token extraction and cookie handling
    const headers = createWpHeaders(req);

    // Call WordPress API to create invoice with force flag
    const invoiceResp = await fetch(`${wpBase}/ca/v1/portal/create-invoice`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        estimateId,
        locationId,
        inviteToken,
        force: true, // Force creation even if invoice exists
      }),
    });

    const invoiceBody = await invoiceResp.json();

    if (invoiceResp.ok && invoiceBody.invoice) {
      return res.status(200).json({
        ok: true,
        invoice: invoiceBody.invoice,
        exists: invoiceBody.exists ?? false,
      });
    }

    // Return error response
    return res.status(invoiceResp.status || 500).json({
      ok: false,
      err: invoiceBody.err || invoiceBody.error || "Failed to create invoice",
      details: invoiceBody.details || null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      err: error instanceof Error ? error.message : "Failed to retry invoice creation",
    });
  }
}

