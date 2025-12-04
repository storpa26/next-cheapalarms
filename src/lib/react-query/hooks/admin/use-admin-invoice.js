import { useQuery } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

/**
 * React Query hook for fetching a single admin invoice
 */
export function useAdminInvoice({ invoiceId, locationId, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-invoice', invoiceId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      return wpFetch(`/ca/v1/admin/invoices/${invoiceId}${search ? `?${search}` : ''}`);
    },
    enabled: enabled && !!invoiceId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

