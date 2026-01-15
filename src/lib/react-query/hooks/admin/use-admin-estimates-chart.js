import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook for fetching estimates chart data (time-series)
 * Uses Next.js API route (/api/admin/estimates/chart) which runs server-side
 */
export function useAdminEstimatesChart({ 
  range = '30d',
  enabled = true 
} = {}) {
  return useQuery({
    queryKey: ['admin-estimates-chart', range],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('range', range);

      const res = await fetch(`/api/admin/estimates/chart?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to fetch chart data');
      }
      return json;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}
