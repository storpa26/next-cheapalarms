import { useQuery } from '@tanstack/react-query';
import { getPortalStatus } from '@/lib/wp';

/**
 * React Query hook for fetching portal status
 * Automatically handles caching, deduplication, and refetching
 */
export function usePortalStatus({ estimateId, locationId, inviteToken, enabled = true, initialData }) {
  return useQuery({
    queryKey: ['portal-status', estimateId, locationId, inviteToken],
    queryFn: () => getPortalStatus(
      { estimateId, locationId, inviteToken },
      { credentials: 'include' }
    ),
    enabled: enabled && !!estimateId,
    initialData,
    // Set staleTime to Infinity when we have SSR data to prevent ANY refetches
    // This is the KEY fix - prevents React Query from thinking data is stale and refetching
    staleTime: initialData ? Infinity : 2 * 60 * 1000, // Infinity if SSR data exists, else 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent all automatic refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

