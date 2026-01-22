import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * React Query hook for checking Xero connection status
 */
export function useXeroStatus() {
  return useQuery({
    queryKey: ['xero-status'],
    queryFn: async () => {
      const res = await fetch('/api/xero/status', {
        credentials: 'include',
      });
      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          error = { err: `HTTP ${res.status}: ${res.statusText}` };
        }
        throw new Error(error.err || error.error || 'Failed to check Xero status');
      }
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

/**
 * React Query hook for getting Xero authorization URL
 */
export function useXeroAuthorize() {
  return useQuery({
    queryKey: ['xero-authorize'],
    queryFn: async () => {
      const res = await fetch('/api/xero/authorize', {
        credentials: 'include',
      });
      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          error = { err: `HTTP ${res.status}: ${res.statusText}` };
        }
        // Preserve error code and details for better error handling
        const errorMessage = error.err || error.error || 'Failed to get Xero authorization URL';
        const apiError = new Error(errorMessage);
        if (error.code) {
          apiError.code = error.code;
        }
        if (error.error) {
          apiError.originalError = error.error;
        }
        throw apiError;
      }
      return res.json();
    },
    enabled: false, // Only fetch when explicitly called
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query mutation for disconnecting Xero
 */
export function useXeroDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/xero/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          error = { err: `HTTP ${res.status}: ${res.statusText}` };
        }
        throw new Error(error.err || error.error || 'Failed to disconnect Xero');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate status query to refetch
      queryClient.invalidateQueries({ queryKey: ['xero-status'] });
    },
  });
}

/**
 * React Query mutation for syncing invoice to Xero
 */
export function useSyncInvoiceToXero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId }) => {
      const res = await fetch('/api/xero/sync-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invoiceId, locationId }),
      });
      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          error = { err: `HTTP ${res.status}: ${res.statusText}` };
        }
        throw new Error(error.err || error.error || 'Failed to sync invoice to Xero');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate invoice queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

/**
 * React Query mutation for syncing payments to Xero (existing invoice).
 */
export function useSyncPaymentToXero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId, transactionId }) => {
      const res = await fetch('/api/xero/sync-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invoiceId, locationId, transactionId }),
      });
      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          error = { err: `HTTP ${res.status}: ${res.statusText}` };
        }
        throw new Error(error.err || error.error || 'Failed to sync payment to Xero');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

