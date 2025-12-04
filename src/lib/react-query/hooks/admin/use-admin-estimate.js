import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

/**
 * React Query hook for fetching a single admin estimate
 */
export function useAdminEstimate({ estimateId, locationId, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimate', estimateId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}${search ? `?${search}` : ''}`);
    },
    enabled: enabled && !!estimateId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

