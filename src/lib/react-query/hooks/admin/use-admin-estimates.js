import { useQuery } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

/**
 * React Query hook for fetching admin estimates list
 */
export function useAdminEstimates({ search, status, portalStatus, page = 1, pageSize = 20, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimates', search, status, portalStatus, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (portalStatus) params.set('portalStatus', portalStatus);
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/estimates?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch estimates');
      }

      return res.json();
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

