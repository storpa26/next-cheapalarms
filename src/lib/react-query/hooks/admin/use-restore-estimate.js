import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query mutation for restoring a single estimate from trash
 * Includes optimistic updates for better UX
 */
export function useRestoreEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const data = await wpFetch(`/ca/v1/admin/estimates/${estimateId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(locationId && { locationId }),
        }),
      });

      if (!data?.ok) {
        throw new Error(data?.error || 'Failed to restore estimate');
      }

      return data;
    },
    onMutate: async ({ estimateId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-estimates-trash'] });
      await queryClient.cancelQueries({ queryKey: ['admin-estimates'] });

      // Snapshot previous values
      const previousTrash = queryClient.getQueryData(['admin-estimates-trash']);
      const previousEstimates = queryClient.getQueryData(['admin-estimates']);

      // Optimistically remove from trash
      queryClient.setQueryData(['admin-estimates-trash'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items?.filter((item) => item.id !== estimateId) || [],
          count: Math.max(0, (old.count || 0) - 1),
        };
      });

      return { previousTrash, previousEstimates };
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates-trash'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });

      toast.success('Estimate restored', {
        description: 'Estimate moved back to active list. Portal meta will regenerate on next sync.',
        duration: 5000,
      });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousTrash) {
        queryClient.setQueryData(['admin-estimates-trash'], context.previousTrash);
      }
      if (context?.previousEstimates) {
        queryClient.setQueryData(['admin-estimates'], context.previousEstimates);
      }

      const message = error.message || 'Failed to restore estimate';
      toast.error('Restore failed', {
        description: message,
      });
    },
  });
}

