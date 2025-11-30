import { useQuery } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

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
      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/estimates/${estimateId}${search ? `?${search}` : ''}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch estimate');
      }

      return res.json();
    },
    enabled: enabled && !!estimateId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

