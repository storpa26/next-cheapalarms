/**
 * Server-side auth context fetched from WordPress
 * WordPress is the sole source of truth (Next.js never decodes JWT)
 */

import { AUTH_TIMEOUT } from "../api/constants";

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
    return null;
  }

  // Check if cookie contains the token
  const hasToken = req.headers.cookie.includes('ca_jwt=');
  if (!hasToken) {
    return null;
  }

  const wpBase = getWpJsonBase();

  try {
    // Add timeout to prevent hanging (using AUTH_TIMEOUT constant)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

    let response;
    try {
      // Extract only ca_jwt cookie to ensure clean format
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const caJwtCookie = cookies.find(c => c.startsWith('ca_jwt='));
      const cookieHeader = caJwtCookie || req.headers.cookie;

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

    if (response.status === 401) {
      return null;
    }
    if (!response.ok) {
      const text = await response.text().catch(() => 'Unable to read error');
      console.error('[getAuthContext] WordPress error', response.status, response.statusText, text.substring(0, 200));
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('[getAuthContext] Failed to parse JSON response:', jsonError.message);
      return null;
    }
    
    if (!data?.ok) {
      console.error('[getAuthContext] WordPress response not ok:', data?.code || 'unknown');
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      avatar: data.avatar || null,
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
