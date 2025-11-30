import { useMutation, useQueryClient } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

/**
 * React Query mutation for syncing an invoice from GHL
 */
export function useSyncInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId }) => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/invoices/${invoiceId}/sync${search ? `?${search}` : ''}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to sync invoice');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

