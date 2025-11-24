import { TOKEN_COOKIE } from "./wp";

/**
 * Check if user is authenticated by looking for JWT token in cookies
 * Works both server-side and client-side
 */
export function isAuthenticated(req = null) {
  // Server-side: check request cookies
  if (req && typeof window === "undefined") {
    const cookieHeader = req.headers?.cookie ?? "";
    if (!cookieHeader) return false;
    
    // Simple check for token existence
    return cookieHeader.includes(`${TOKEN_COOKIE}=`);
  }
  
  // Client-side: check document.cookie
  if (typeof window !== "undefined") {
    const cookieString = document.cookie || "";
    const cookies = {};
    cookieString.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) {
        cookies[name] = decodeURIComponent(rest.join('='));
      }
    });
    return !!cookies[TOKEN_COOKIE];
  }
  
  return false;
}

/**
 * Get the redirect destination with return URL
 */
export function getLoginRedirect(from) {
  if (!from) return "/login";
  return `/login?from=${encodeURIComponent(from)}`;
}

