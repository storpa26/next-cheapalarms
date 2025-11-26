import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // Prevent all automatic refetches - data is only fetched when explicitly needed
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // Use structural sharing to prevent unnecessary re-renders
      structuralSharing: true,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});

