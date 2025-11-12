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

  const url = `${WP_API_BASE}${path}`;

  const headers = normaliseHeaders(options.headers);
  let token =
    options.token ??
    headers.Authorization?.replace(/^Bearer\s+/i, "") ??
    extractTokenFromHeaders(headers);

  if (!token && typeof window !== "undefined") {
    const parsed = parseCookie(document.cookie || "");
    token = parsed[TOKEN_COOKIE] ?? null;
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

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

