import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * React Query hook for fetching estimate photos
 * Automatically handles caching, deduplication, and refetching
 */
export function useEstimatePhotos({ estimateId, enabled = true, initialData }) {
  const queryClient = useQueryClient();
  
  // Check if we have cached data for this query
  const cachedData = queryClient.getQueryData(['estimate-photos', estimateId]);
  
  return useQuery({
    queryKey: ['estimate-photos', estimateId],
    queryFn: async () => {
      const res = await fetch(`/api/estimate/photos?estimateId=${encodeURIComponent(estimateId)}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to fetch photos');
      }

      return res.json();
    },
    enabled: enabled && !!estimateId,
    // Use placeholderData to check cache first - prevents refetch if data exists
    placeholderData: initialData || cachedData,
    // Increase staleTime significantly - match other hooks
    staleTime: initialData ? Infinity : 5 * 60 * 1000, // Infinity if we have initial data, else 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Prevent all automatic refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * React Query mutation for storing estimate photos
 * Automatically invalidates and refetches photo queries
 */
export function useStoreEstimatePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, uploads }) => {
      const res = await fetch('/api/estimate/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId, uploads }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.err || error.error || 'Failed to store photos');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries (this automatically triggers refetch for active queries)
      queryClient.invalidateQueries({ queryKey: ['estimate-photos', variables.estimateId] });
      // FIX: Removed duplicate toast - UploadModal shows its own success toast
      // toast.success('Photo uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to save photos', {
        description: error.message || 'Please try again or contact support if the problem persists.',
        duration: 5000,
      });
    },
    // FIX: Add retry configuration for transient failures
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
  });
}

