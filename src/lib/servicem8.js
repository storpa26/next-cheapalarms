/**
 * ServiceM8 API wrapper
 * Similar to ghlFetch but for ServiceM8 REST API
 * Base URL: https://api.servicem8.com/api_1.0/
 * 
 * Uses X-API-Key header for private applications (API key authentication)
 * NOT Authorization: Bearer (that's for OAuth 2.0 public applications)
 */
export async function servicem8Fetch(
  path,
  { method = "GET", body, headers: extraHeaders = {} } = {}
) {
  const base = process.env.SERVICEM8_API_BASE || "https://api.servicem8.com/api_1.0";
  
  if (!process.env.SERVICEM8_API_KEY) {
    const err = new Error("Missing SERVICEM8_API_KEY");
    err.status = 500;
    throw err;
  }

  const headers = {
    "X-API-Key": process.env.SERVICEM8_API_KEY,
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const url = `${base}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let text = "";
  try {
    text = await res.text();
  } catch (_e) {
    text = "";
  }

  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_e) {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const err = new Error("ServiceM8 request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

