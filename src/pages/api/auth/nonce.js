// Simple endpoint to expose a WP REST nonce (server-to-WP fetch)
// NEXT_PUBLIC_WP_URL should include /wp-json (e.g., http://localhost:8882/wp-json)

export default async function handler(req, res) {
  try {
    // Get WordPress API base (should include /wp-json)
    let wpBase = process.env.NEXT_PUBLIC_WP_URL || '';
    
    // Fallback for development
    if (!wpBase && process.env.NODE_ENV === 'development') {
      wpBase = 'http://localhost:10013/wp-json';
    }
    
    if (!wpBase) {
      return res.status(500).json({ ok: false, error: 'WP base URL not configured' });
    }

    // Ensure wpBase ends with /wp-json (normalize)
    if (!wpBase.endsWith('/wp-json')) {
      wpBase = wpBase.replace(/\/$/, '') + '/wp-json';
    }

    const inviteToken = req.query.inviteToken || '';
    const estimateId = req.query.estimateId || '';
    
    // Build WordPress API path (without /wp-json since it's in wpBase)
    const path = inviteToken && estimateId
      ? `/ca/v1/auth/nonce-invite?estimateId=${encodeURIComponent(estimateId)}&inviteToken=${encodeURIComponent(inviteToken)}`
      : '/ca/v1/auth/nonce';

    const fullUrl = `${wpBase}${path}`;
    
    const resp = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || !data?.nonce) {
      // Enhanced error logging for debugging
      const errorDetails = {
        status: resp.status,
        statusText: resp.statusText,
        wpUrl: fullUrl,
        hasInviteToken: !!inviteToken,
        hasEstimateId: !!estimateId,
        wpError: data?.err || data?.error || 'Unknown error',
        wpCode: data?.code,
      };
      
      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('[nonce.js] WordPress nonce fetch failed:', errorDetails);
      }
      
      return res.status(resp.status || 500).json({
        ok: false,
        error: data?.err || data?.error || 'Failed to fetch nonce from WordPress',
        // Include debug info in development
        ...(process.env.NODE_ENV === 'development' ? { debug: errorDetails } : {}),
      });
    }

    return res.status(200).json({ ok: true, nonce: data.nonce });
  } catch (err) {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('[nonce.js] Exception:', err.message, err.stack);
    }
    return res.status(500).json({ ok: false, error: err.message || 'Failed to fetch nonce' });
  }
}

