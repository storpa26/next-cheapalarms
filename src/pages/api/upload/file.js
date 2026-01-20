/**
 * Proxy endpoint for file uploads (multipart/form-data)
 * POST /api/upload/file?token=...
 * 
 * This endpoint proxies multipart/form-data to WordPress.
 * The token is passed as a query parameter (as expected by WordPress).
 */
import { getWpBase } from "../../../lib/api/wp-proxy";
import { createWpHeaders } from "../../../lib/api/wp-proxy";

// Disable Next.js body parser for this route to handle raw multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  const wpBase = getWpBase();
  if (!wpBase) {
    return res.status(500).json({ ok: false, err: "WP API base not configured" });
  }

  try {
    // Extract token from query params (WordPress expects it this way)
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ ok: false, err: "Token required" });
    }

    // Get WordPress headers (includes cookie and auth)
    const headers = createWpHeaders(req);
    
    // Preserve the Content-Type with boundary from the original request
    // This is critical for multipart/form-data parsing
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType;
    }

    // Preserve Content-Length if available
    if (req.headers['content-length']) {
      headers['Content-Length'] = req.headers['content-length'];
    }

    // Build WordPress URL with token
    const wpUrl = `${wpBase}/ca/v1/upload?token=${encodeURIComponent(token)}`;

    // Read the request body as a buffer
    // When bodyParser is false, we need to manually read from req
    let bodyBuffer;
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      bodyBuffer = Buffer.concat(chunks);
    } catch (readError) {
      return res.status(400).json({
        ok: false,
        err: `Failed to read request body: ${readError instanceof Error ? readError.message : 'Unknown error'}`,
      });
    }

    // Forward the request to WordPress
    const wpResp = await fetch(wpUrl, {
      method: "POST",
      headers,
      body: bodyBuffer,
    });

    // Forward response status
    res.status(wpResp.status);

    // Forward response headers (except ones we control)
    wpResp.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    // Stream response body
    const responseBody = await wpResp.text();
    
    // Try to parse as JSON, fallback to text
    try {
      const json = JSON.parse(responseBody);
      return res.json(json);
    } catch {
      return res.send(responseBody);
    }
  } catch (e) {
    return res.status(500).json({
      ok: false,
      err: e instanceof Error ? e.message : "Failed to proxy upload",
    });
  }
}
