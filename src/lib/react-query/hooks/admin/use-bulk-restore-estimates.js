import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for bulk restoring estimates from trash
 * Includes optimistic updates and progress tracking
 */
export function useBulkRestoreEstimates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateIds, locationId }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch('/api/admin/estimates/bulk-restore', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'BULK_RESTORE',
          estimateIds,
          ...(locationId && { locationId }),
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to restore estimates');
      }

      return json;
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

      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useBulkRestoreEstimates] Error:', error, { variables });
      }

      const message = error.message || 'Failed to restore estimates';
      toast.error('Bulk restore failed', {
        description: message,
      });
    },
  });
}

