import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for accepting an estimate
 * Automatically invalidates and refetches portal status
 */
export function useAcceptEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const res = await fetch('/api/portal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId }),
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
          
          // If invoice exists, clear any previous error
          if (data.invoice) {
            updatedData.invoice = data.invoice;
            updatedData.invoiceError = undefined;
          }
          // If invoiceError exists, store it for retry functionality
          else if (data.invoiceError) {
            updatedData.invoiceError = data.invoiceError;
          }
          
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
      
      // Invalidate queries (this automatically triggers refetch for active queries)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
      
      // Show success toast
      toast.success('Estimate accepted successfully!');
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
    mutationFn: async ({ estimateId, locationId, reason = '' }) => {
      const res = await fetch('/api/portal/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, reason }),
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
      // Invalidate queries (this automatically triggers refetch for active queries)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
      
      // Show success toast
      toast.success('Estimate rejected successfully');
    },
  });
}

