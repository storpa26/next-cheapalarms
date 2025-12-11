import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

/**
 * React Query hook for fetching admin estimates list
 */
export function useAdminEstimates({ search, status, portalStatus, workflowStatus, page = 1, pageSize = 20, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimates', search, status, portalStatus, workflowStatus, page, pageSize],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (portalStatus) params.set('portalStatus', portalStatus);
        if (workflowStatus) params.set('workflowStatus', workflowStatus); // NEW: Add workflow status filter
        params.set('page', page.toString());
        params.set('pageSize', pageSize.toString());

        return await wpFetch(`/ca/v1/admin/estimates?${params.toString()}`);
      } catch (error) {
        // Transform error to user-friendly format
        const errorMessage = error?.message || error?.err || 'Failed to fetch estimates';
        throw new Error(errorMessage);
      }
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

