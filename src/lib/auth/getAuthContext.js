/**
 * Server-side auth context fetched from WordPress
 * WordPress is the sole source of truth (Next.js never decodes JWT)
 */

function getWpJsonBase() {
  const base =
    process.env.WP_JSON_BASE ||
    process.env.NEXT_PUBLIC_WP_URL; // fallback

  if (base) return base;
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10013/wp-json';
  }
  throw new Error('WP JSON base URL is not set');
}

export async function getAuthContext(req) {
  if (!req?.headers?.cookie) {
    console.log('[getAuthContext] No cookies in request');
    return null;
  }

  const wpBase = getWpJsonBase();
  console.log('[getAuthContext] WordPress base:', wpBase);

  // Check if cookie contains the token
  const hasToken = req.headers.cookie.includes('ca_jwt=');
  if (!hasToken) {
    console.log('[getAuthContext] No ca_jwt cookie found');
    return null;
  }

  // Extract ca_jwt cookie for logging (first 50 chars only)
  const cookieMatch = req.headers.cookie.match(/ca_jwt=([^;]+)/);
  const tokenPreview = cookieMatch ? cookieMatch[1].substring(0, 50) + '...' : 'not found';
  console.log('[getAuthContext] Token preview:', tokenPreview);

  try {
    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      // FIX: Extract only ca_jwt cookie to ensure clean format
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const caJwtCookie = cookies.find(c => c.startsWith('ca_jwt='));
      const cookieHeader = caJwtCookie || req.headers.cookie;

      console.log('[getAuthContext] Making request to:', `${wpBase}/ca/v1/auth/me`);
      console.log('[getAuthContext] Cookie header length:', cookieHeader.length);

      response = await fetch(`${wpBase}/ca/v1/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
          'User-Agent': 'Next.js-SSR',
        },
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[getAuthContext] Fetch error:', fetchError.message);
      if (fetchError.name === 'AbortError') {
        console.error('[getAuthContext] Request timed out to', wpBase);
        return null;
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    console.log('[getAuthContext] Response status:', response.status);

    if (response.status === 401) {
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error('[getAuthContext] WordPress returned 401');
      console.error('[getAuthContext] Error response:', errorText.substring(0, 500));
      return null;
    }
    if (!response.ok) {
      const text = await response.text().catch(() => 'Unable to read error');
      console.error('[getAuthContext] WP error', response.status, response.statusText, text.substring(0, 200));
      return null;
    }

    const data = await response.json();
    if (!data?.ok) {
      console.error('[getAuthContext] WordPress response not ok', data);
      return null;
    }

    console.log('[getAuthContext] Authentication successful, user ID:', data.id);
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      roles: data.roles || [],
      capabilities: data.capabilities || [],
      isAdmin: data.is_admin === true,
      isCustomer: data.is_customer === true,
    };
  } catch (err) {
    console.error('[getAuthContext] Exception', err?.message || err);
    return null;
  }
}

