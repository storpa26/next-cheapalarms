import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../../../admin/constants';

/**
 * React Query hook for fetching admin estimates list
 * Uses Next.js API route (/api/admin/estimates) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useAdminEstimates({ search, status, portalStatus, workflowStatus, startDate, endDate, page = 1, pageSize = DEFAULT_PAGE_SIZE, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimates', search, status, portalStatus, workflowStatus, startDate, endDate, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (portalStatus) params.set('portalStatus', portalStatus);
      if (workflowStatus) params.set('workflowStatus', workflowStatus);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to fetch estimates');
      }
      return json;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

