import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for syncing an invoice from GHL
 * Uses Next.js API route (/api/admin/invoices/[invoiceId]/sync) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useSyncInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId }) => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const url = `/api/admin/invoices/${invoiceId}/sync${search ? `?${search}` : ''}`;

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to sync invoice');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useSyncInvoice] Error:', error, { variables });
      }
      
      const message = error.message || 'Failed to sync invoice';
      toast.error(message);
    },
  });
}

/**
 * React Query mutation for sending an invoice
 * Uses Next.js API route (/api/admin/invoices/[invoiceId]/send) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId, method = 'email' }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, method }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to send invoice');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useSendInvoice] Error:', error, { variables });
      }
      
      const message = error.message || 'Failed to send invoice';
      toast.error(message);
    },
  });
}

