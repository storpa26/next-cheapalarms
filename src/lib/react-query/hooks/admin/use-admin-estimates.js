import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

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

      return wpFetch(`/ca/v1/admin/estimates?${params.toString()}`);
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

