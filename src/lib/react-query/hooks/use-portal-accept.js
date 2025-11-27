import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * React Query mutation for accepting an estimate
 * Automatically invalidates and refetches portal status
 */
export function useAcceptEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId }) => {
      const res = await fetch('/api/portal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to accept estimate');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate portal status to refetch
      queryClient.invalidateQueries({ queryKey: ['portal-status', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.estimateId] });
    },
  });
}

/**
 * React Query mutation for rejecting an estimate
 * Automatically invalidates and refetches portal status
 */
export function useRejectEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, reason = '' }) => {
      const res = await fetch('/api/portal/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to reject estimate');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate portal status to refetch
      queryClient.invalidateQueries({ queryKey: ['portal-status', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.estimateId] });
    },
  });
}

