import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';

/**
 * React Query mutation for deleting a GHL contact (GHL only)
 */
export function useDeleteGhlContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, locationId }) => {
      const data = await wpFetch(`/ca/v1/admin/ghl/contacts/${contactId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'DELETE',
          locationId,
        }),
      });

      const ghlOk = data?.ghl?.ok === true;
      if (!(data?.ok === true && ghlOk)) {
        throw new Error(data?.error || data?.ghl?.error || 'Delete failed');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });
      toast.success('GHL contact deleted successfully');
    },
    onError: (error) => {
      const message = error.message || 'Failed to delete GHL contact';
      toast.error(message);
    },
  });
}


