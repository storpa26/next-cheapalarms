import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseWpFetchError } from '../../../admin/utils/error-handler';

/**
 * React Query mutation for syncing an estimate from GHL
 * Uses Next.js API route (/api/admin/estimates/[estimateId]/sync) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useSyncEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const url = `/api/admin/estimates/${estimateId}/sync${search ? `?${search}` : ''}`;

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to sync estimate');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      // Also invalidate portal queries so customer sees updated estimate
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active',
      });
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useSyncEstimate] Error:', error, { variables });
      }
      
      const message = error.message || 'Failed to sync estimate';
      toast.error(message);
    },
  });
}

/**
 * React Query mutation for creating an invoice from an estimate
 * Uses Next.js API route (/api/admin/estimates/[estimateId]/create-invoice) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useCreateInvoiceFromEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/create-invoice`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to create invoice');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate and invoice queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      if (data?.invoice?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin-invoice', data.invoice.id] });
      }
      // Also invalidate portal queries so customer sees new invoice
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active',
      });
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useCreateInvoiceFromEstimate] Error:', error, { variables });
      }
      
      const message = error.message || 'Failed to create invoice';
      toast.error(message);
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
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, method }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to send estimate');
      }

      return json;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      
      // Snapshot previous value for rollback
      const previousEstimate = queryClient.getQueryData(['admin-estimate', variables.estimateId]);
      
      // Optimistically update portal meta to show estimate was sent
      // Only update if we have valid data structure
      if (
        previousEstimate && 
        typeof previousEstimate === 'object' && 
        previousEstimate.portalMeta &&
        typeof previousEstimate.portalMeta === 'object'
      ) {
        const portalMeta = previousEstimate.portalMeta;
        const quote = portalMeta.quote || {};
        const workflow = portalMeta.workflow || {};
        
        // Check if photos are required (match backend logic)
        const photosRequired = !!(quote.photos_required);
        
        // Increment revision number (match backend logic)
        const currentRevision = quote.revisionNumber || 0;
        const newRevision = currentRevision + 1;
        
        // Determine workflow status (match backend logic)
        // If no photos required, set to 'ready_to_accept' so customer can accept immediately
        // If photos required, set to 'sent' so customer must upload photos first
        const workflowStatus = !photosRequired ? 'ready_to_accept' : 'sent';
        
        queryClient.setQueryData(['admin-estimate', variables.estimateId], {
          ...previousEstimate,
          portalMeta: {
            ...portalMeta,
            workflow: {
              ...workflow,
              status: workflowStatus, // CHANGED: ready_to_accept if no photos, sent if photos required
              currentStep: 2,
            },
            quote: {
              ...quote,
              status: 'sent',
              sentAt: new Date().toISOString(),
              // AUTO-ENABLE ACCEPTANCE if no photos required (match backend logic)
              acceptance_enabled: !photosRequired, // NEW: true if no photos, false if photos required
              revisionNumber: newRevision, // NEW: Increment revision number
              approval_requested: false, // Reset approval request when resending
            },
          },
        });
      }
      
      return { previousEstimate };
    },
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success('Estimate sent successfully');
      
      // Invalidate admin estimate queries
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      
      // CRITICAL: Invalidate portal-status queries so customer portal updates immediately
      // Use predicate to match all portal-status queries for this estimateId (regardless of locationId/inviteToken)
      // refetchType: 'active' forces refetch even with staleTime: Infinity
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch for active queries
      });
      
      // Also invalidate portal dashboard (for overview page)
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active', // Force refetch
      });
      
      // Invalidate estimate queries (used by portal for full estimate data)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'estimate' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch
      });
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousEstimate) {
        queryClient.setQueryData(['admin-estimate', variables.estimateId], context.previousEstimate);
      }
      
      // Log error for debugging (sanitized in production)
      const errorInfo = {
        message: err?.message || 'Unknown error',
        estimateId: variables.estimateId,
        mutation: 'sendEstimate',
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Send estimate mutation error:', err, errorInfo);
      } else {
        // In production, log sanitized error info
        // TODO: Integrate with error tracking service (e.g., Sentry)
        // ErrorTracking.captureException(err, { extra: errorInfo });
        console.error('Send estimate mutation error:', errorInfo);
      }
      
      // Show error toast
      const errorMessage = parseWpFetchError(err);
      toast.error(errorMessage || 'Failed to send estimate');
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
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/complete-review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to complete review');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      // Also invalidate portal queries so customer sees updated status
      // refetchType: 'active' forces refetch even with staleTime: Infinity
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch for active queries
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active', // Force refetch
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'estimate' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch
      });
      toast.success('Review completed. Acceptance has been enabled for the customer.');
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useCompleteReview] Error:', error, { variables });
      }
      
      const errorMessage = parseWpFetchError(error);
      toast.error(errorMessage || 'Failed to complete review');
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
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/request-changes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, reason }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to request changes');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate estimate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      // Also invalidate portal queries so customer sees updated status
      // refetchType: 'active' forces refetch even with staleTime: Infinity
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch for active queries
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active', // Force refetch
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'estimate' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch
      });
      toast.success('Changes requested. Customer can now resubmit photos.');
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useRequestChanges] Error:', error, { variables });
      }
      
      const errorMessage = parseWpFetchError(error);
      toast.error(errorMessage || 'Failed to request changes');
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
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          locationId, 
          revisionData, // Backend detects this and sends revision email
          revisionNote 
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to send revision notification');
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate admin estimate queries
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      
      // CRITICAL: Also invalidate portal queries so customer sees updated estimate
      // refetchType: 'active' forces refetch even with staleTime: Infinity
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch for active queries
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active', // Force refetch
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'estimate' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch
      });
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      const errorInfo = {
        message: error?.message || 'Unknown error',
        estimateId: variables.estimateId,
        mutation: 'sendRevisionNotification',
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Send revision notification mutation error:', error, errorInfo);
      } else {
        // In production, log sanitized error info
        // TODO: Integrate with error tracking service (e.g., Sentry)
        // ErrorTracking.captureException(error, { extra: errorInfo });
        console.error('Send revision notification mutation error:', errorInfo);
      }
      
      // Show error toast to user
      const errorMessage = parseWpFetchError(error);
      toast.error(errorMessage || 'Failed to send revision notification');
    },
  });
}

