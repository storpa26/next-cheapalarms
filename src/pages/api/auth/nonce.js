// Simple endpoint to expose a WP REST nonce (server-to-WP fetch)
// Assumes NEXT_PUBLIC_WP_URL is set to the WordPress base URL (no trailing slash)

export default async function handler(req, res) {
  try {
    const wpBase = process.env.NEXT_PUBLIC_WP_URL || '';
    if (!wpBase) {
      return res.status(500).json({ ok: false, error: 'WP base URL not configured' });
    }

    const inviteToken = req.query.inviteToken || '';
    const estimateId = req.query.estimateId || '';
    const path = inviteToken && estimateId
      ? `/wp-json/ca/v1/auth/nonce-invite?estimateId=${encodeURIComponent(estimateId)}&inviteToken=${encodeURIComponent(inviteToken)}`
      : '/wp-json/ca/v1/auth/nonce';

    const resp = await fetch(`${wpBase}${path}`, {
      method: 'GET',
      headers: {
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || !data?.nonce) {
      return res.status(resp.status || 500).json({
        ok: false,
        error: data?.err || data?.error || 'Failed to fetch nonce from WordPress',
      });
    }

    return res.status(200).json({ ok: true, nonce: data.nonce });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to fetch nonce' });
  }
}

