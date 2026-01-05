import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

/**
 * React Query hook for fetching trash (soft-deleted estimates)
 * @param {string} locationId - Location ID to filter by
 * @param {number} limit - Maximum number of items to fetch (default: 100)
 * @param {boolean} enabled - Whether the query is enabled
 */
export function useAdminEstimatesTrash({ locationId, limit = 100, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimates-trash', locationId, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (locationId) params.set('locationId', locationId);
        params.set('limit', limit.toString());

        const data = await wpFetch(`/ca/v1/admin/estimates/trash?${params.toString()}`);
        
        if (!data?.ok) {
          throw new Error(data?.error || 'Failed to fetch trash');
        }

        return {
          items: data.items || [],
          count: data.count || 0,
        };
      } catch (error) {
        const errorMessage = error?.message || error?.err || 'Failed to fetch trash';
        throw new Error(errorMessage);
      }
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

