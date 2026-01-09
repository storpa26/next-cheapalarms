import { proxyToWordPress } from "@/lib/api/wp-proxy";

/**
 * Health check API route
 * Proxies to WordPress /ca/v1/health/detailed endpoint
 * Requires admin authentication
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  try {
    // Proxy to WordPress health check endpoint (detailed check requires auth)
    // Note: proxyToWordPress expects path relative to wp-json base
    return proxyToWordPress(req, res, "/ca/v1/health/detailed", {
      allowedMethods: ["GET"],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    
    // Log error for debugging (server-side only)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Health Check API] Error:', message);
    }
    
    return res.status(500).json({ 
      ok: false, 
      err: "Failed to fetch health status",
      // Only expose internal error details in development
      ...(process.env.NODE_ENV === 'development' && { details: message })
    });
  }
}

