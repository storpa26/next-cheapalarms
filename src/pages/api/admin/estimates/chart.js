import { createWpHeaders, getWpBase } from '../../../../lib/api/wp-proxy';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, err: 'Method not allowed' });
  }

  try {
    const wpBase = getWpBase();
    if (!wpBase) {
      return res.status(500).json({ ok: false, err: 'WP API base not configured' });
    }

    const range = req.query.range || '30d';
    const params = new URLSearchParams();
    params.set('range', range);

    const headers = createWpHeaders(req);
    // wpBase should already include /wp-json based on how other endpoints use it
    // If not, append it
    const wpApiBase = wpBase.includes('/wp-json') ? wpBase : `${wpBase}/wp-json`;
    const url = `${wpApiBase}/ca/v1/admin/estimates/chart?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        const errorData = await response.json();
        errorText = errorData?.err || errorData?.message || errorData?.error || `HTTP ${response.status}`;
      } catch {
        errorText = await response.text().catch(() => `HTTP ${response.status}: ${response.statusText}`);
      }
      return res.status(response.status).json({
        ok: false,
        err: errorText.substring(0, 500),
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      err: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
