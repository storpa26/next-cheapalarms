import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

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
      return wpFetch(`/ca/v1/admin/invoices/${invoiceId}/sync${search ? `?${search}` : ''}`, {
        method: 'POST',
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

/**
 * React Query mutation for sending an invoice
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId, method = 'email' }) => {
      return wpFetch(`/ca/v1/admin/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, method }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

