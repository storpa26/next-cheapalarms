import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

/**
 * React Query mutation for deleting an invoice
 * @param {string} scope - 'local' | 'ghl' | 'both'
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ invoiceId, locationId, scope = 'both' }) => {
      const data = await wpFetch(`/ca/v1/admin/invoices/${invoiceId}/delete`, {
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
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', variables.invoiceId] });
      
      // Navigate back to invoices list
      router.push('/admin/invoices');
      
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      const message = error.message || 'Failed to delete invoice';
      toast.error(message);
    },
  });
}

