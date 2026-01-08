import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query hook for emptying trash (permanently deleting all soft-deleted estimates)
 */
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId }) => {
      // wpFetch returns parsed JSON, not a Response object
      const data = await wpFetch('/ca/v1/admin/estimates/trash/empty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: 'EMPTY_TRASH',
          locationId,
        }),
      });

      // Check data.ok (not response.ok) - matches pattern from useRestoreEstimate, useBulkRestoreEstimates
      if (!data?.ok) {
        throw new Error(data?.error || data?.err || 'Failed to empty trash');
      }

      return data;
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
    onError: (error) => {
      toast.error(error.message || 'Failed to empty trash. Please try again.');
    },
  });
}

