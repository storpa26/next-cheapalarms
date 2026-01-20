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
  // TEMPORARY: Diagnostic logging for customer redirect loop
  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';
  
  if (isDev) {
    console.log('[getAuthContext] Called - has cookies:', !!req?.headers?.cookie);
    if (req?.headers?.cookie) {
      console.log('[getAuthContext] Cookie contains ca_jwt:', req.headers.cookie.includes('ca_jwt='));
    }
  }

  if (!req?.headers?.cookie) {
    if (isDev) {
      console.log('[getAuthContext] No cookies in request');
    }
    return null;
  }

  const wpBase = getWpJsonBase();
  
  if (isDev) {
    console.log('[getAuthContext] WordPress base:', wpBase);
  }

  // Check if cookie contains the token
  const hasToken = req.headers.cookie.includes('ca_jwt=');
  if (!hasToken) {
    if (isDev) {
      console.log('[getAuthContext] No ca_jwt cookie found in request');
    }
    return null;
  }

  try {
    // Add timeout to prevent hanging (using AUTH_TIMEOUT constant)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

    let response;
    try {
      // FIX: Extract only ca_jwt cookie to ensure clean format
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const caJwtCookie = cookies.find(c => c.startsWith('ca_jwt='));
      const cookieHeader = caJwtCookie || req.headers.cookie;

      if (isDev) {
        console.log('[getAuthContext] Making request to:', `${wpBase}/ca/v1/auth/me`);
        console.log('[getAuthContext] Cookie header length:', cookieHeader.length);
      }

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

    if (isDev) {
      console.log('[getAuthContext] Response status:', response.status);
    }

    if (response.status === 401) {
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error('[getAuthContext] WordPress returned 401:', errorText.substring(0, 500));
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
      const text = await response.text().catch(() => 'Unable to read response');
      console.error('[getAuthContext] Response text:', text.substring(0, 500));
      return null;
    }
    
    if (!data?.ok) {
      console.error('[getAuthContext] WordPress response not ok:', JSON.stringify(data, null, 2));
      return null;
    }
    
    if (isDev) {
      console.log('[getAuthContext] Authentication successful - User ID:', data.id, 'isAdmin:', data.is_admin, 'isCustomer:', data.is_customer);
      console.log('[getAuthContext] Full response:', JSON.stringify(data, null, 2));
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
    console.error('[getAuthContext] Exception', err?.message || err);
    return null;
  }
}

