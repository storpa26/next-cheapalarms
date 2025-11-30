import { useQuery } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

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
      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/invoices/${invoiceId}${search ? `?${search}` : ''}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch invoice');
      }

      return res.json();
    },
    enabled: enabled && !!invoiceId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

