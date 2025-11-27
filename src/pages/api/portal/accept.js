import { WP_API_BASE } from "@/lib/wp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  try {
    const payload = req.body ?? {};

    const resp = await fetch(`${wpBase}/ca/v1/portal/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...devHeader,
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const body = await resp.json();

    if (resp.ok && payload.skipInvoice !== true) {
      try {
        const invoiceResp = await fetch(`${wpBase}/ca/v1/portal/create-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...devHeader,
            ...(req.headers.cookie && { Cookie: req.headers.cookie }),
          },
          credentials: "include",
          body: JSON.stringify({
            estimateId: payload.estimateId,
            locationId: payload.locationId,
            inviteToken: payload.inviteToken,
            force: payload.forceInvoice === true,
          }),
        });
        const invoiceBody = await invoiceResp.json();
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
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
  }
}

