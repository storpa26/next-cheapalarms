/**
 * Server-side auth context fetched from WordPress
 * WordPress is the sole source of truth (Next.js never decodes JWT)
 */

function getWpJsonBase() {
  const base = process.env.WP_JSON_BASE;
  if (base) return base;
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10013/wp-json';
  }
  throw new Error('WP_JSON_BASE environment variable is not set');
}

export async function getAuthContext(req) {
  if (!req?.headers?.cookie) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAuthContext] No cookies in request');
    }
    return null;
  }

  const wpBase = getWpJsonBase();

  // Check if cookie contains the token
  const hasToken = req.headers.cookie.includes('ca_jwt=');
  if (!hasToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAuthContext] No ca_jwt cookie found');
    }
    return null;
  }

  try {
    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(`${wpBase}/ca/v1/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: req.headers.cookie || '',
        },
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getAuthContext] Request timed out to', wpBase);
        }
        return null;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('[getAuthContext] Fetch error', fetchError.message);
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (response.status === 401) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[getAuthContext] WordPress returned 401 (not authenticated)');
      }
      return null;
    }
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        const text = await response.text().catch(() => 'Unable to read error');
        console.error('[getAuthContext] WP error', response.status, response.statusText, text.substring(0, 200));
      }
      return null;
    }

    const data = await response.json();
    if (!data?.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[getAuthContext] WordPress response not ok', data);
      }
      return null;
    }

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
    if (process.env.NODE_ENV === 'development') {
      console.error('[getAuthContext] Exception', err?.message || err);
    }
    return null;
  }
}

