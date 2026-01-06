import { useQuery } from "@tanstack/react-query";

/**
 * Fetch logs from WordPress API
 * 
 * @param {Object} options - Fetch options
 * @param {number} options.limit - Number of lines to fetch
 * @param {string} options.level - Filter by level
 * @param {string} options.search - Search query
 * @param {string} options.requestId - Filter by request ID
 * @param {AbortSignal} options.signal - Abort signal for request cancellation
 */
async function fetchLogs({ limit = 100, level = "", search = "", requestId = "", signal = undefined }) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (level) params.append("level", level);
  if (search) params.append("search", search);
  if (requestId) params.append("request_id", requestId);

  try {
    const res = await fetch(`/api/admin/logs?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      signal, // Support request cancellation
    });

    const json = await res.json().catch(() => null);
    
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || "Failed to load logs");
    }
    
    return json;
  } catch (error) {
    // Handle AbortError gracefully (request was cancelled)
    if (error.name === 'AbortError' || error instanceof DOMException) {
      // Return a rejected promise that React Query can handle
      // Use a specific error message that can be checked in retry logic
      const abortError = new Error('Request cancelled');
      abortError.name = 'AbortError';
      throw abortError;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * React Query hook for admin logs
 * 
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of log lines to fetch (default: 100)
 * @param {string} options.level - Filter by log level (error, warning, info, debug)
 * @param {string} options.search - Search query to filter logs
 * @param {string} options.requestId - Filter by request ID
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} React Query result
 */
export function useAdminLogs({ limit = 100, level = "", search = "", requestId = "", enabled = true } = {}) {
  return useQuery({
    queryKey: ["admin-logs", limit, level, search, requestId],
    queryFn: ({ signal }) => fetchLogs({ limit, level, search, requestId, signal }),
    enabled,
    staleTime: 5 * 1000, // Consider stale after 5 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on abort errors (request was cancelled)
      if (error?.name === 'AbortError' || error?.message === 'Request cancelled') {
        return false;
      }
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
  });
}

