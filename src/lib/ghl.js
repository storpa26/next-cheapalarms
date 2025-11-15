export async function ghlFetch(
  path,
  { method = "GET", body, includeLocationHeader = false, headers: extraHeaders = {}, raw } = {}
) {
  const base = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
  if (!process.env.GHL_API_KEY) {
    const err = new Error("Missing GHL_API_KEY");
    err.status = 500;
    throw err;
  }
  const headers = {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
    ...extraHeaders,
  };
  if (includeLocationHeader && process.env.GHL_LOCATION_ID) {
    headers.LocationId = process.env.GHL_LOCATION_ID;
  }
  const url = raw ? path : `${base}${path}`;
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
    const err = new Error("GHL request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
