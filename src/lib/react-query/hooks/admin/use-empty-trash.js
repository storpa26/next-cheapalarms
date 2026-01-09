import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query hook for emptying trash (permanently deleting all soft-deleted estimates)
 */
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch('/api/admin/estimates/trash/empty', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: 'EMPTY_TRASH',
          locationId,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to empty trash');
      }

      return json;
    },
    onSuccess: (data) => {
      // Invalidate and refetch trash list
      queryClient.invalidateQueries({ queryKey: ['admin-estimates-trash'] });
      // Also invalidate main estimates list in case any were restored
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });

      const deletedCount = data.deleted || 0;
      const errorCount = data.errors?.length || 0;
      
      // Match pattern from useBulkRestoreEstimates - handle partial errors
      if (errorCount > 0) {
        toast.warning(
          `Trash emptied with ${errorCount} error${errorCount !== 1 ? 's' : ''}. ${deletedCount} item${deletedCount !== 1 ? 's' : ''} deleted.`,
          { duration: 7000 }
        );
      } else {
        toast.success(
          `Trash emptied successfully. ${deletedCount} item${deletedCount !== 1 ? 's' : ''} permanently deleted.`
        );
      }
    },
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useEmptyTrash] Error:', error, { variables });
      }

      toast.error(error.message || 'Failed to empty trash. Please try again.');
    },
  });
}

