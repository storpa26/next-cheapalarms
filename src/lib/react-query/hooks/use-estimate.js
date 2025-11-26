import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook for fetching estimate data
 * Automatically handles caching, deduplication, and refetching
 */
export function useEstimate({ estimateId, locationId, inviteToken, enabled = true, initialData }) {
  return useQuery({
    queryKey: ['estimate', estimateId, locationId, inviteToken],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('estimateId', estimateId);
      if (locationId) params.set('locationId', locationId);
      if (inviteToken) params.set('inviteToken', inviteToken);

      const res = await fetch(`/api/estimate?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch estimate');
      }

      return res.json();
    },
    enabled: enabled && !!estimateId,
    placeholderData: initialData,
    staleTime: initialData ? Infinity : 5 * 60 * 1000, // Infinity if we have initial data, else 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent all automatic refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

