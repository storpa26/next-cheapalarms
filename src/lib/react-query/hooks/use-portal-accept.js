import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWpNonceSafe } from '../../api/get-wp-nonce';

/**
 * React Query mutation for accepting an estimate
 * Automatically invalidates and refetches portal status
 */
export function useAcceptEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, inviteToken }) => {
      // Pass inviteToken if available, otherwise use logged-in auth
      const nonce = await getWpNonceSafe({ estimateId, inviteToken }).catch((err) => {
        const msg = err?.code === 'AUTH_REQUIRED'
          ? 'Session expired. Please log in again.'
          : (err?.message || 'Failed to accept estimate.');
        throw new Error(msg);
      });
      if (!nonce) {
        throw new Error('Session required.');
      }
      const res = await fetch('/api/portal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce || '' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, inviteToken }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to accept estimate');
      }

      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
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

      // Optimistically update all matching queries
      queryClient.getQueryCache().findAll({
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      }).forEach(query => {
        const currentData = queryClient.getQueryData(query.queryKey);
        if (currentData) {
          // Create a new object to ensure React detects the change
          // Format: YYYY-MM-DD HH:MM:SS (WordPress MySQL format)
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          const acceptedAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          
          // Create a completely new object to ensure React Query detects the change
          const updatedData = {
            ...currentData,
            quote: {
              ...(currentData.quote || {}),
              status: 'accepted',
              statusLabel: 'Accepted',
              acceptedAt: acceptedAt,
              canAccept: false,
            },
            workflow: {
              ...(currentData.workflow || {}),
              status: 'accepted', // NEW: Update workflow status to match quote status
              currentStep: 3,
              acceptedAt: acceptedAt,
            }
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
    },
    onSuccess: (data, variables) => {
      // Update cache with invoice error if present (for retry functionality)
      // Or clear invoiceError if invoice was successfully created
      queryClient.getQueryCache().findAll({
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      }).forEach(query => {
        const currentData = queryClient.getQueryData(query.queryKey);
        if (currentData) {
          const updatedData = { ...currentData };
          
          // Ensure workflow status is 'accepted' (backend should have updated it, but ensure consistency)
          // Since we're in onSuccess, the request succeeded, so we can safely update
          if (currentData.workflow) {
            updatedData.workflow = {
              ...currentData.workflow,
              status: 'accepted',
              currentStep: 3,
            };
          }
          
          // If invoice exists, clear any previous error
          if (data.invoice) {
            updatedData.invoice = data.invoice;
            updatedData.invoiceError = undefined;
          }
          // If invoiceError exists, store it for retry functionality
          else if (data.invoiceError) {
            updatedData.invoiceError = data.invoiceError;
            // Log invoice error for debugging
            console.error('[Accept Estimate] Invoice creation failed:', data.invoiceError);
          }
          
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
      
      // Invalidate queries and force refetch (refetchType: 'all' overrides staleTime: Infinity and works for inactive queries)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'all', // Force refetch for all queries (active and inactive)
      });
      queryClient.invalidateQueries({ 
        queryKey: ['estimate', variables.estimateId],
        refetchType: 'all', // Force refetch
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'all', // Force refetch
      });
      
      // Show toast notifications
      // Always show success toast since estimate was accepted
      // If invoice creation failed, also show warning toast with details
      if (data.invoiceError) {
        toast.warning('Estimate accepted, but invoice creation failed', {
          description: data.invoiceError,
          duration: 5000,
        });
        // Also show success toast to confirm acceptance
        toast.success('Estimate accepted successfully!', {
          duration: 3000,
        });
      } else {
        toast.success('Estimate accepted successfully!');
      }
    },
  });
}

/**
 * React Query mutation for rejecting an estimate
 * Automatically invalidates and refetches portal status
 */
export function useRejectEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, reason = '', inviteToken }) => {
      // Pass inviteToken if available, otherwise use logged-in auth
      const nonce = await getWpNonceSafe({ estimateId, inviteToken }).catch((err) => {
        const msg = err?.code === 'AUTH_REQUIRED'
          ? 'Session expired. Please log in again.'
          : (err?.message || 'Failed to reject estimate.');
        throw new Error(msg);
      });
      if (!nonce) {
        throw new Error('Session required.');
      }
      const res = await fetch('/api/portal/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce || '' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, reason, inviteToken }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to reject estimate');
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
          // Format: YYYY-MM-DD HH:MM:SS (WordPress MySQL format)
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          const rejectedAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          
          const updatedData = {
            ...currentData,
            quote: {
              ...(currentData.quote || {}),
              status: 'rejected',
              statusLabel: 'Rejected',
              rejectedAt: rejectedAt,
              canAccept: false,
            }
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
    },
    onSuccess: (data, variables) => {
      // Invalidate queries and force refetch (refetchType: 'all' overrides staleTime: Infinity and works for inactive queries)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId,
        refetchType: 'all', // Force refetch for all queries (active and inactive)
      });
      queryClient.invalidateQueries({ 
        queryKey: ['estimate', variables.estimateId],
        refetchType: 'all', // Force refetch
      });
      queryClient.invalidateQueries({ 
        queryKey: ['portal-dashboard'],
        refetchType: 'all', // Force refetch
      });
      
      // Show success toast
      toast.success('Estimate rejected successfully');
    },
  });
}

