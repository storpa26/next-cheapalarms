import { getWpBase, createWpHeaders, parseWpResponse } from "../../../lib/api/wp-proxy";

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

    const { body, status } = await parseWpResponse(resp);

    if (status === 200 && payload.skipInvoice !== true) {
      try {
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
        const { body: invoiceBody, ok: invoiceOk } = await parseWpResponse(invoiceResp);

        if (invoiceOk) {
          body.invoice = invoiceBody?.invoice ?? null;
          body.invoiceExists = invoiceBody?.exists ?? false;
        } else {
          body.invoiceError = invoiceBody?.err ?? invoiceBody?.error ?? "Failed to generate invoice";
        }
      } catch (error) {
        body.invoiceError = error instanceof Error ? error.message : "Failed to generate invoice";
      }
    }

    return res.status(status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, err: e instanceof Error ? e.message : "Failed" });
  }
}

