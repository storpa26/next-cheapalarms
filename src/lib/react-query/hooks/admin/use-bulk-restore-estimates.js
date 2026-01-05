import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query mutation for bulk restoring estimates from trash
 * Includes optimistic updates and progress tracking
 */
export function useBulkRestoreEstimates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateIds, locationId }) => {
      const data = await wpFetch(`/ca/v1/admin/estimates/bulk-restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'BULK_RESTORE',
          estimateIds,
          ...(locationId && { locationId }),
        }),
      });

      if (!data?.ok) {
        throw new Error(data?.error || 'Failed to restore estimates');
      }

      return data;
    },
    onMutate: async ({ estimateIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-estimates-trash'] });
      await queryClient.cancelQueries({ queryKey: ['admin-estimates'] });

      // Snapshot previous values
      const previousTrash = queryClient.getQueryData(['admin-estimates-trash']);
      const previousEstimates = queryClient.getQueryData(['admin-estimates']);

      // Optimistically remove from trash
      queryClient.setQueryData(['admin-estimates-trash'], (old) => {
        if (!old) return old;
        const idsSet = new Set(estimateIds);
        return {
          ...old,
          items: old.items?.filter((item) => !idsSet.has(item.id)) || [],
          count: Math.max(0, (old.count || 0) - estimateIds.length),
        };
      });

      return { previousTrash, previousEstimates };
    },
    onSuccess: (data, variables) => {
      const restored = data.restored || 0;
      const errors = data.errors || [];

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates-trash'] });

      if (errors.length > 0) {
        toast.warning(`Restored ${restored} estimates`, {
          description: `${errors.length} estimate(s) failed to restore. Check console for details.`,
          duration: 6000,
        });
      } else {
        toast.success(`Restored ${restored} estimates`, {
          description: 'All estimates moved back to active list.',
          duration: 5000,
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousTrash) {
        queryClient.setQueryData(['admin-estimates-trash'], context.previousTrash);
      }
      if (context?.previousEstimates) {
        queryClient.setQueryData(['admin-estimates'], context.previousEstimates);
      }

      const message = error.message || 'Failed to restore estimates';
      toast.error('Bulk restore failed', {
        description: message,
      });
    },
  });
}

