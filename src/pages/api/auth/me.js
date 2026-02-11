import { getAuthContext } from "../../../lib/auth/getAuthContext";

/**
 * GET /api/auth/me — client-side proxy to get the current user's profile.
 * Forwards the httpOnly JWT cookie to WordPress /ca/v1/auth/me and
 * returns the normalised authContext object.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  try {
    const authContext = await getAuthContext(req);

    if (!authContext) {
      return res.status(401).json({ ok: false, err: "Not authenticated" });
    }

    return res.status(200).json({ ok: true, user: authContext });
  } catch (error) {
    console.error("[api/auth/me] Error:", error?.message || error);
    return res.status(500).json({ ok: false, err: "Internal server error" });
  }
}
