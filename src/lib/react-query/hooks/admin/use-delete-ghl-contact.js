import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for deleting a GHL contact (GHL only)
 */
export function useDeleteGhlContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, locationId }) => {
      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(`/api/admin/ghl/contacts/${contactId}/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'DELETE',
          locationId,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Delete failed');
      }

      const data = json;

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
    onError: (error, variables) => {
      // Log error for debugging (sanitized in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('[useDeleteGhlContact] Error:', error, { variables });
      }

      const message = error.message || 'Failed to delete GHL contact';
      toast.error(message);
    },
  });
}


