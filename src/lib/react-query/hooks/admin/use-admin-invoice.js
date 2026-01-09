import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook for fetching a single admin invoice
 * Uses Next.js API route (/api/admin/invoices/[invoiceId]) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useAdminInvoice({ invoiceId, locationId, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-invoice', invoiceId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const url = `/api/admin/invoices/${invoiceId}${search ? `?${search}` : ''}`;

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to fetch invoice');
      }
      return json;
    },
    enabled: enabled && !!invoiceId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

