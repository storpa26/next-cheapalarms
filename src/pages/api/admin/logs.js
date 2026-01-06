import { proxyToWordPress } from "@/lib/api/wp-proxy";

/**
 * Logs API route
 * Proxies to WordPress /ca/v1/admin/logs endpoint
 * Requires admin authentication
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Proxy to WordPress logs endpoint
    return proxyToWordPress(req, res, "/ca/v1/admin/logs", {
      allowedMethods: ["GET"],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    
    // Log error for debugging (server-side only)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Logs API] Error:', message);
    }
    
    return res.status(500).json({ 
      ok: false, 
      error: "Failed to fetch logs",
      // Only expose internal error details in development
      ...(process.env.NODE_ENV === 'development' && { details: message })
    });
  }
}

