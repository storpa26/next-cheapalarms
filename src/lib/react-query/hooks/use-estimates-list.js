import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * React Query hook for fetching estimates list
 * Automatically handles caching, deduplication, and refetching
 */
export function useEstimatesList({ limit = 50, enabled = true, initialData } = {}) {
  const queryClient = useQueryClient();
  
  // Check if we have cached data for this query
  const cachedData = queryClient.getQueryData(['estimates-list', limit]);
  
  // If we have initialData, disable the query to prevent refetching
  // This prevents 403 errors when SSR data is available
  const shouldEnable = enabled && !initialData;
  
  return useQuery({
    queryKey: ['estimates-list', limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.set('limit', limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`/api/estimate/list${queryString}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch estimates');
      }

      return res.json();
    },
    enabled: shouldEnable,
    placeholderData: initialData || cachedData,
    initialData: initialData, // Use initialData instead of placeholderData for SSR data
    staleTime: initialData ? Infinity : 5 * 60 * 1000, // Infinity if we have initial data, else 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't throw errors - return undefined instead so UI doesn't vanish
    throwOnError: false,
  });
}

