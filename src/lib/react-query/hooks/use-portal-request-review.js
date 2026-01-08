import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWpNonceSafe } from '@/lib/api/get-wp-nonce';

/**
 * React Query mutation for requesting review of an estimate
 * Automatically invalidates and refetches portal status
 */
export function useRequestReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, inviteToken }) => {
      // Pass inviteToken if available, otherwise use logged-in auth
      const nonce = await getWpNonceSafe({ estimateId, inviteToken }).catch((err) => {
        const msg = err?.code === 'AUTH_REQUIRED'
          ? 'Session expired. Please log in again.'
          : (err?.message || 'Failed to request review.');
        throw new Error(msg);
      });
      if (!nonce) {
        throw new Error('Session required.');
      }
      const res = await fetch('/api/portal/request-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce || '' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to request review');
      }

      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      });

      // Snapshot the previous value for rollback
      const previousQueries = [];
      queryClient.getQueryCache().findAll({
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      }).forEach(query => {
        previousQueries.push({
          queryKey: query.queryKey,
          data: queryClient.getQueryData(query.queryKey)
        });
      });

      // Optimistically update
      queryClient.getQueryCache().findAll({
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      }).forEach(query => {
        const currentData = queryClient.getQueryData(query.queryKey);
        if (currentData) {
          const updatedData = {
            ...currentData,
            quote: {
              ...(currentData.quote || {}),
              approval_requested: true,
            },
            workflow: {
              ...(currentData.workflow || {}),
              status: 'under_review',
            },
            photos: {
              ...(currentData.photos || {}),
              // Auto-submit photos if they were uploaded but not submitted
              submission_status: currentData.photos?.uploaded > 0 
                ? (currentData.photos?.submission_status || 'submitted')
                : currentData.photos?.submission_status,
              submitted_at: currentData.photos?.uploaded > 0 && !currentData.photos?.submitted_at
                ? new Date().toISOString().replace('T', ' ').substring(0, 19)
                : currentData.photos?.submitted_at,
            },
          };
          
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || 'Failed to request review');
    },
    onSuccess: (data, variables) => {
      // Invalidate queries and force refetch (refetchType: 'active' overrides staleTime: Infinity)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'active', // Force refetch for active queries
      });
      queryClient.invalidateQueries({ 
        queryKey: ['estimate', variables.estimateId],
        refetchType: 'active', // Force refetch
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'active', // Force refetch
      });
      
      // Show success toast
      toast.success('Review requested successfully! Admin will review and notify you when acceptance is enabled.');
    },
  });
}

