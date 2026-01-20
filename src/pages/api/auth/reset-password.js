import { WP_API_BASE } from "../../../lib/wp.server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};

  try {
    const resp = await fetch(`${wpBase}/ca/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...devHeader,
      },
      credentials: "include",
      body: JSON.stringify(req.body ?? {}),
    });

    // Check response content type before parsing
    const contentType = resp.headers.get("content-type") || "";
    let body;
    
    if (contentType.includes("application/json")) {
      try {
        const text = await resp.text();
        if (!text) {
          // Empty response
          return res.status(resp.status || 500).json({ 
            ok: false, 
            error: "Empty response from server",
            code: "empty_response",
            err: "Empty response from server"
          });
        }
        body = JSON.parse(text);
      } catch (jsonError) {
        // JSON parsing failed - log and return error
        console.error("[reset-password] JSON parse error:", jsonError);
        return res.status(500).json({ 
          ok: false, 
          error: "Invalid response from server",
          code: "invalid_response",
          err: "Invalid response from server"
        });
      }
    } else {
      // Non-JSON response (likely HTML error page from PHP fatal error)
      const text = await resp.text();
      console.error("[reset-password] Non-JSON response (status:", resp.status, "):", text.substring(0, 200));
      return res.status(resp.status || 500).json({ 
        ok: false, 
        error: "Server error occurred",
        code: "server_error",
        err: "Server error occurred"
      });
    }

    // Return the response with proper status code
    return res.status(resp.status).json(body);
  } catch (e) {
    // Network errors, timeouts, etc.
    console.error("[reset-password] Fetch error:", e);
    return res.status(500).json({ 
      ok: false, 
      error: e instanceof Error ? e.message : "Failed to connect to server",
      code: "network_error",
      err: e instanceof Error ? e.message : "Failed"
    });
  }
}

