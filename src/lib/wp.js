import { parse as parseCookie } from "cookie";

const TOKEN_COOKIE = "ca_jwt";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:10013/wp-json"
    : "");

async function wpFetch(path, options = {}) {
  if (!path.startsWith("/")) {
    throw new Error("wpFetch expects path to start with '/'");
  }

  // Validate WP_API_BASE before making request
  if (!WP_API_BASE) {
    throw new Error("WordPress API base URL is not configured. Please set NEXT_PUBLIC_WP_URL environment variable.");
  }

  const url = `${WP_API_BASE}${path}`;

  const headers = normaliseHeaders(options.headers);
  let token =
    options.token ??
    headers.Authorization?.replace(/^Bearer\s+/i, "") ??
    extractTokenFromHeaders(headers);

  if (!token && typeof window !== "undefined") {
    // Browser-compatible cookie parsing
    const cookieString = document.cookie || "";
    const cookies = {};
    cookieString.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) {
        cookies[name] = decodeURIComponent(rest.join('='));
      }
    });
    token = cookies[TOKEN_COOKIE] ?? null;
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
      next: {
        revalidate: options.next?.revalidate ?? 30,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `WP error ${response.status} ${response.statusText}: ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    // Handle network errors (Failed to fetch, CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to WordPress API. Please check your connection and API configuration.");
    }
    // Re-throw other errors (including our custom errors)
    throw error;
  }
}

export async function getEstimates(params = {}, fetchOptions = {}) {
  const search = new URLSearchParams(params).toString();
  const path = `/ca/v1/estimate/list${search ? `?${search}` : ""}`;
  return wpFetch(path, fetchOptions);
}

export async function getPortalStatus(
  { estimateId, locationId, inviteToken },
  fetchOptions = {}
) {
  const params = new URLSearchParams();
  if (estimateId) params.set("estimateId", estimateId);
  if (locationId) params.set("locationId", locationId);
  if (inviteToken) params.set("inviteToken", inviteToken);

  const search = params.toString();
  return wpFetch(`/ca/v1/portal/status?${search}`, fetchOptions);
}

export async function getPortalDashboard(fetchOptions = {}) {
  return wpFetch('/ca/v1/portal/dashboard', fetchOptions);
}

export async function authenticate({ username, password }) {
  return wpFetch("/ca/v1/auth/token", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}

export async function resendPortalInvite({ estimateId, locationId }) {
  return wpFetch("/ca/v1/portal/resend-invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      estimateId,
      locationId,
    }),
  });
}

export { WP_API_BASE, TOKEN_COOKIE };

function normaliseHeaders(customHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  for (const [key, value] of Object.entries(customHeaders)) {
    if (value === undefined || value === null) continue;
    headers[normaliseHeaderKey(key)] = value;
  }

  const cookieHeader = headers.Cookie ?? headers.cookie;
  if (cookieHeader) {
    delete headers.cookie;
    headers.Cookie = cookieHeader;
  }

  return headers;
}

function normaliseHeaderKey(key) {
  if (!key) return key;
  return key
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join("-");
}

function extractTokenFromHeaders(headers) {
  const cookieHeader = headers.Cookie ?? "";
  if (!cookieHeader) return null;
  const parsed = parseCookie(cookieHeader);
  const token = parsed[TOKEN_COOKIE] ?? null;
  delete headers.Cookie;
  return token;
}

