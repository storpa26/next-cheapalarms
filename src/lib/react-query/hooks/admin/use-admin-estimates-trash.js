import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook for fetching trash (soft-deleted estimates)
 * Uses Next.js API route (/api/admin/estimates/trash) which runs server-side
 * and can read httpOnly cookies for authentication.
 * @param {string} locationId - Location ID to filter by
 * @param {number} limit - Maximum number of items to fetch (default: 100)
 * @param {boolean} enabled - Whether the query is enabled
 */
export function useAdminEstimatesTrash({ locationId, limit = 100, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimates-trash', locationId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);
      params.set('limit', limit.toString());

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/trash?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to fetch trash');
      }

      return {
        items: json.items || [],
        count: json.count || 0,
      };
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

