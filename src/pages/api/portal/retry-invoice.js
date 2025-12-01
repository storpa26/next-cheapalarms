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
    const { estimateId, locationId, inviteToken } = payload;

    if (!estimateId) {
      return res.status(400).json({ ok: false, error: "estimateId is required" });
    }

    // Call WordPress API to create invoice with force flag
    const invoiceResp = await fetch(`${wpBase}/ca/v1/portal/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...devHeader,
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
      },
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
      error: invoiceBody.err || invoiceBody.error || "Failed to create invoice",
      details: invoiceBody.details || null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to retry invoice creation",
    });
  }
}

