import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiFetch';

/**
 * React Query hook for fetching portal dashboard data
 * Automatically handles caching, deduplication, and refetching
 * Uses Next.js API route instead of direct WordPress calls
 */
export function usePortalDashboard({ enabled = true, initialData } = {}) {
  return useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: () => apiFetch('/api/portal/dashboard'),
    enabled,
    initialData,
    // Set staleTime to Infinity when we have SSR data to prevent ANY refetches
    staleTime: initialData ? Infinity : 2 * 60 * 1000, // Infinity if SSR data exists, else 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent all automatic refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

