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
    // Allow refetching when explicitly invalidated (e.g., after acceptance)
    // But prevent automatic refetches to avoid unnecessary API calls
    staleTime: 0, // Always allow refetch when invalidated
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent automatic refetches (but allow manual invalidation)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

