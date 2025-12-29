import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

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
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/sync${search ? `?${search}` : ''}`, {
        method: 'POST',
      });
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
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      });
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

/**
 * React Query mutation for sending an estimate
 */
export function useSendEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, method = 'email' }) => {
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, method }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    },
  });
}

/**
 * React Query mutation for completing review
 * Transitions workflow from "under_review" to "ready_to_accept"
 * Enables acceptance for customer
 */
export function useCompleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/complete-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      // Also invalidate portal status in case admin is viewing customer portal
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      });
      toast.success('Review completed. Acceptance has been enabled for the customer.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to complete review');
    },
  });
}

/**
 * React Query mutation for requesting changes to photos
 * Resets photos submission status and allows customer to resubmit
 */
export function useRequestChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, reason = '' }) => {
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, reason }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      // Also invalidate portal status in case admin is viewing customer portal
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      });
      toast.success('Changes requested. Customer can now resubmit photos.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to request changes');
    },
  });
}

/**
 * React Query mutation for sending revision notifications
 * Separate from useSendEstimate to avoid UI confusion (button loading state)
 * Used when admin updates estimate and wants to notify customer
 */
export function useSendRevisionNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, revisionNote, revisionData }) => {
      return wpFetch(`/ca/v1/admin/estimates/${estimateId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          locationId, 
          revisionData, // Backend detects this and sends revision email
          revisionNote 
        }),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    },
  });
}

