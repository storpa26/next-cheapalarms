import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query mutation for deleting a user/contact
 * @param {string} scope - 'local' | 'ghl' | 'both'
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, locationId, scope = 'both' }) => {
      const data = await wpFetch(`/ca/v1/admin/users/${userId}/delete`, {
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
      // Invalidate user and contact queries
      queryClient.invalidateQueries({ queryKey: ['wp-users'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });
      
      toast.success('User/contact deleted successfully');
    },
    onError: (error) => {
      const message = error.message || 'Failed to delete user/contact';
      toast.error(message);
    },
  });
}

