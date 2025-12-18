import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { DEFAULT_PAGE_SIZE } from '@/lib/admin/constants';

/**
 * React Query hook for fetching admin invoices list
 */
export function useAdminInvoices({ search, status, page = 1, pageSize = DEFAULT_PAGE_SIZE, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-invoices', search, status, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      return wpFetch(`/ca/v1/admin/invoices?${params.toString()}`);
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

