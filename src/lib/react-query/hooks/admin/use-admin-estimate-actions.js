import { useMutation, useQueryClient } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

/**
 * React Query mutation for syncing an estimate from GHL
 */
export function useSyncEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/estimates/${estimateId}/sync${search ? `?${search}` : ''}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to sync estimate');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    },
  });
}

/**
 * React Query mutation for creating an invoice from an estimate
 */
export function useCreateInvoiceFromEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const res = await fetch(`${WP_API_BASE}/ca/v1/admin/estimates/${estimateId}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locationId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to create invoice');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate and invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      if (data?.invoice?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin-invoice', data.invoice.id] });
      }
    },
  });
}

