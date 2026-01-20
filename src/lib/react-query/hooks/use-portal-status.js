import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiFetch';

/**
 * React Query hook for fetching portal status
 * Automatically handles caching, deduplication, and refetching
 * Uses Next.js API route instead of direct WordPress calls
 */
export function usePortalStatus({ estimateId, locationId, inviteToken, enabled = true, initialData }) {
  return useQuery({
    queryKey: ['portal-status', estimateId, locationId, inviteToken],
    queryFn: () => apiFetch('/api/portal/status', {
      params: {
        estimateId,
        locationId,
        inviteToken,
      },
    }),
    enabled: enabled && !!estimateId,
    initialData,
    // Use SSR data when available, otherwise cache for 2-5 minutes
    // This prevents unnecessary refetches while still allowing manual invalidation
    staleTime: initialData ? Infinity : 2 * 60 * 1000, // Infinity if SSR data exists, else 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent automatic refetches (but allow manual invalidation)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

