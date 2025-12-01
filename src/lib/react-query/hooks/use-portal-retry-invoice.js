import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for retrying invoice creation after a failure.
 * Automatically invalidates and refetches portal status.
 */
export function useRetryInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, inviteToken }) => {
      const res = await fetch('/api/portal/retry-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, inviteToken }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.err || 'Failed to retry invoice creation');
      }

      return res.json();
    },
    onError: (error) => {
      toast.error('Failed to create invoice', {
        description: error.message || 'Please try again or contact support if the problem persists.',
      });
    },
    onSuccess: (data, variables) => {
      // Update cache with invoice data and clear any errors
      queryClient.getQueryCache().findAll({
        predicate: (query) => 
          query.queryKey[0] === 'portal-status' && 
          query.queryKey[1] === variables.estimateId
      }).forEach(query => {
        const currentData = queryClient.getQueryData(query.queryKey);
        if (currentData) {
          queryClient.setQueryData(query.queryKey, {
            ...currentData,
            invoice: data.invoice,
            invoiceError: undefined, // Clear error
          });
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
      
      toast.success('Invoice created successfully', {
        description: 'Your invoice has been generated and is ready for payment.',
      });
    },
  });
}

