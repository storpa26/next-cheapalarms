import { useQuery } from "@tanstack/react-query";

/**
 * Fetch health check status from WordPress API
 */
async function fetchHealthCheck() {
  const res = await fetch("/api/admin/health", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json().catch(() => null);
  
  // WordPress returns { status: "healthy"|"degraded", checks: {...} }
  // Check for HTTP error OR missing status field
  if (!res.ok || !json?.status) {
    throw new Error(json?.error || json?.err || "Failed to load health check");
  }
  
  return json;
}

/**
 * React Query hook for health check status
 * 
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {number|false} options.refetchInterval - Auto-refresh interval in ms (default: 30000 = 30s), or false to disable
 * @returns {Object} React Query result
 */
export function useHealthCheck({ enabled = true, refetchInterval = 30000 } = {}) {
  return useQuery({
    queryKey: ["admin-health-check"],
    queryFn: fetchHealthCheck,
    enabled,
    staleTime: 30 * 1000, // Consider stale after 30 seconds (was 10)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Only refetch on reconnect (network issue)
    refetchInterval: refetchInterval === false ? false : refetchInterval, // Explicit false when disabled
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
  });
}

