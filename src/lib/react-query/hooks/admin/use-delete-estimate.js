import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

/**
 * React Query mutation for deleting an estimate
 * @param {string} scope - 'local' | 'ghl' | 'both'
 */
export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, scope = 'both' }) => {
      const data = await wpFetch(`/ca/v1/admin/estimates/${estimateId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'DELETE',
          scope,
          locationId,
        }),
      });

      const localOk = data?.local?.ok === true;
      const ghlOk = data?.ghl?.ok === true;
      const effectiveOk =
        data?.ok === true &&
        (scope === 'local' ? localOk : scope === 'ghl' ? ghlOk : localOk && ghlOk);

      if (!effectiveOk) {
        throw new Error(
          data?.error ||
            data?.ghl?.error ||
            data?.local?.error ||
            'Delete failed'
        );
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all estimate queries
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      
      // Navigate back to estimates list
      router.push('/admin/estimates');
      
      toast.success('Estimate deleted successfully');
    },
    onError: (error) => {
      const message = error.message || 'Failed to delete estimate';
      toast.error(message);
    },
  });
}

