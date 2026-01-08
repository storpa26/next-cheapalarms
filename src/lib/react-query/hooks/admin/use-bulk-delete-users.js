import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query mutation for bulk deleting users/contacts
 * Includes optimistic updates and progress tracking
 */
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, locationId, scope = 'both' }) => {
      const data = await wpFetch(`/ca/v1/admin/users/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'BULK_DELETE',
          userIds,
          scope,
          ...(locationId && { locationId }),
        }),
      });

      if (!data?.ok) {
        throw new Error(data?.error || 'Failed to delete users');
      }

      return data;
    },
    onMutate: async ({ userIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wp-users'] });
      await queryClient.cancelQueries({ queryKey: ['ghl-contacts'] });

      // Snapshot previous values
      const previousUsers = queryClient.getQueryData(['wp-users']);
      const previousContacts = queryClient.getQueryData(['ghl-contacts']);

      // Optimistically remove from lists
      queryClient.setQueryData(['wp-users'], (old) => {
        if (!old) return old;
        const idsSet = new Set(userIds.map(String));
        return Array.isArray(old) 
          ? old.filter((user) => !idsSet.has(String(user.id)))
          : old;
      });

      // Note: ghl-contacts may have different structure, so we only update wp-users optimistically
      // GHL contacts will be refetched on success via query invalidation

      return { previousUsers, previousContacts };
    },
    onSuccess: (data, variables) => {
      const deleted = data.deleted || 0;
      const errors = data.errors || [];
      const scope = variables.scope || 'both';

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['wp-users'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });

      if (errors.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Bulk delete partial failures:', errors);
        }
        toast.warning(`Deleted ${deleted} user${deleted !== 1 ? 's' : ''}`, {
          description: `${errors.length} user(s) failed to delete. Check console for details.`,
          duration: 6000,
        });
      } else {
        toast.success(`Deleted ${deleted} user${deleted !== 1 ? 's' : ''} successfully`, {
          description: scope === 'ghl' ? 'The contacts have been removed from GoHighLevel.' : 'The users have been deleted.',
          duration: 5000,
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousUsers) {
        queryClient.setQueryData(['wp-users'], context.previousUsers);
      }
      if (context?.previousContacts) {
        queryClient.setQueryData(['ghl-contacts'], context.previousContacts);
      }

      const message = error.message || 'Failed to delete users';
      toast.error('Bulk delete failed', {
        description: message,
      });
    },
  });
}

