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

    // Use createWpHeaders for consistent JWT token extraction and cookie handling
    const headers = createWpHeaders(req);

    const resp = await fetch(`${wpBase}/ca/v1/portal/accept`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    let body;
    try {
      const text = await resp.text();
      if (!text) {
        return res.status(500).json({ ok: false, err: "Empty response from WordPress API" });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ 
        ok: false, 
        err: "Failed to parse response from WordPress API",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
      });
    }

    if (resp.ok && payload.skipInvoice !== true) {
      try {
        // Reuse headers (includes auth and cookies) for invoice creation
        const invoiceResp = await fetch(`${wpBase}/ca/v1/portal/create-invoice`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            estimateId: payload.estimateId,
            locationId: payload.locationId,
            inviteToken: payload.inviteToken,
            force: payload.forceInvoice === true,
          }),
        });
        let invoiceBody;
        try {
          const invoiceText = await invoiceResp.text();
          if (!invoiceText) {
            body.invoiceError = "Empty response from invoice creation endpoint";
            return res.status(resp.status).json(body);
          }
          invoiceBody = JSON.parse(invoiceText);
        } catch (parseError) {
          body.invoiceError = "Failed to parse invoice creation response";
          return res.status(resp.status).json(body);
        }
        
        if (invoiceResp.ok) {
          body.invoice = invoiceBody.invoice ?? null;
          body.invoiceExists = invoiceBody.exists ?? false;
        } else {
          body.invoiceError = invoiceBody.err || invoiceBody.error || "Failed to generate invoice";
        }
      } catch (error) {
        body.invoiceError = error instanceof Error ? error.message : "Failed to generate invoice";
      }
    }

    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, err: e instanceof Error ? e.message : "Failed" });
  }
}

