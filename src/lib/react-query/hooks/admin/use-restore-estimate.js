import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for restoring a single estimate from trash
 * Includes optimistic updates for better UX
 */
export function useRestoreEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/estimates/${estimateId}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(locationId && { locationId }),
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to restore estimate');
      }

      return json;
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

      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useRestoreEstimate] Error:', error, { variables });
      }

      const message = error.message || 'Failed to restore estimate';
      toast.error('Restore failed', {
        description: message,
      });
    },
  });
}

