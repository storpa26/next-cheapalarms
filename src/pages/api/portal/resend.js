import { resendPortalInvite } from "../../../lib/wp.server";
import { createWpHeaders } from "../../../lib/api/wp-proxy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, err: "Method not allowed." });
  }

  const { estimateId, locationId } = req.body ?? {};
  if (!estimateId) {
    return res
      .status(400)
      .json({ ok: false, err: "estimateId is required to resend an invite." });
  }

  try {
    // Use createWpHeaders for consistent JWT token extraction and cookie handling
    const headers = createWpHeaders(req);
    const result = await resendPortalInvite({ estimateId, locationId }, {
      headers,
    });
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      err: error instanceof Error ? error.message : "Failed to resend invite.",
    });
  }
}

