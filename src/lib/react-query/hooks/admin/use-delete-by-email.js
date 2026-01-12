import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query mutation for complete deletion by email
 * Deletes contact, estimates, invoices, metadata, and WordPress user
 */
export function useDeleteByEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, locationId }) => {
      const res = await fetch('/api/admin/data/delete-by-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(), // Trim email before sending
          confirm: 'DELETE_ALL',
          locationId: locationId || undefined,
        }),
      });

      const json = await res.json().catch(() => null);
      
      // Handle HTTP errors (4xx, 5xx)
      if (!res.ok) {
        // Check for rate limit error specifically
        if (res.status === 429 || json?.code === 'rate_limited') {
          const retryAfter = json?.retry_after || json?.details?.retry_after || 60;
          const error = new Error(
            json?.error || json?.err || `Too many attempts. Please wait ${retryAfter} seconds before trying again.`
          );
          error.code = 'rate_limited';
          error.retryAfter = retryAfter;
          if (json) {
            error.details = {
              contact: json.contact,
              estimates: json.estimates,
              invoices: json.invoices,
              wordpressUser: json.wordpressUser,
              correlationId: json.correlationId,
              code: json.code,
              rateLimit: json.rate_limit,
            };
          }
          throw error;
        }
        
        // Other HTTP errors
        const error = new Error(json?.error || json?.err || 'Delete failed');
        if (json) {
          error.details = {
            contact: json.contact,
            estimates: json.estimates,
            invoices: json.invoices,
            wordpressUser: json.wordpressUser,
            correlationId: json.correlationId,
            code: json.code,
          };
        }
        throw error;
      }

      // Handle partial success (HTTP 200 but ok: false)
      if (!json?.ok) {
        // Check if there are actual errors (not just "not found" cases)
        const { contact, estimates, invoices, wordpressUser } = json || {};
        const hasErrors = 
          (contact?.found && !contact?.ok && contact?.error) ||
          (estimates?.errors?.length > 0) ||
          (invoices?.errors?.length > 0) ||
          (wordpressUser?.found && !wordpressUser?.ok);
        
        if (hasErrors) {
          // Build descriptive error message
          const errorParts = [];
          if (contact?.error) errorParts.push(`Contact: ${contact.error}`);
          if (estimates?.errors?.length) {
            errorParts.push(`${estimates.errors.length} estimate(s) failed`);
          }
          if (invoices?.errors?.length) {
            errorParts.push(`${invoices.errors.length} invoice(s) failed`);
          }
          if (wordpressUser?.found && !wordpressUser?.ok) {
            errorParts.push('WordPress user deletion failed');
          }
          
          const error = new Error(
            json?.error || json?.err || (errorParts.length > 0 ? errorParts.join(', ') : 'Partial deletion failed')
          );
          error.details = {
            contact,
            estimates,
            invoices,
            wordpressUser,
            correlationId: json.correlationId,
          };
          throw error;
        }
        // If no actual errors (just "not found" cases), treat as success
        // This handles cases where contact/user doesn't exist but deletion still succeeded
      }

      return json;
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['wp-users'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      
      const { contact, estimates, invoices, wordpressUser } = data;
      const summary = [
        contact?.deleted && 'Contact',
        estimates?.deleted > 0 && `${estimates.deleted} estimate(s)`,
        invoices?.deleted > 0 && `${invoices.deleted} invoice(s)`,
        wordpressUser?.deleted && 'WordPress user',
      ].filter(Boolean);

      if (summary.length > 0) {
        toast.success(`Complete deletion successful: ${summary.join(', ')}`);
      } else {
        toast.success('No data found to delete for this email');
      }
    },
    onError: (error, variables) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useDeleteByEmail] Error:', error, { variables });
      }
      
      // Handle rate limit errors with specific messaging
      if (error.code === 'rate_limited' || error.message.includes('Too many attempts')) {
        const retryAfter = error.retryAfter || 60;
        toast.error('Rate limit exceeded', {
          description: `Please wait ${retryAfter} seconds before trying again.`,
          duration: 5000,
        });
        return;
      }
      
      // Build detailed error message for other errors
      let errorMessage = error.message || 'Failed to delete by email';
      let errorDescription = null;
      
      if (error.details) {
        const { contact, estimates, invoices, wordpressUser } = error.details;
        const failedItems = [];
        
        if (contact?.error) failedItems.push(`Contact: ${contact.error}`);
        if (estimates?.errors?.length > 0) {
          failedItems.push(`${estimates.errors.length} estimate(s) failed`);
        }
        if (invoices?.errors?.length > 0) {
          failedItems.push(`${invoices.errors.length} invoice(s) failed`);
        }
        if (wordpressUser?.error) failedItems.push(`WordPress user: ${wordpressUser.error}`);
        
        if (failedItems.length > 0) {
          errorDescription = failedItems.join(', ');
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000, // Longer duration for complex errors
      });
    },
  });
}
