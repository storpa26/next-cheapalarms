import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook for fetching a single admin estimate
 * Uses Next.js API route (/api/admin/estimates/[estimateId]) which runs server-side
 * and can read httpOnly cookies for authentication.
 */
export function useAdminEstimate({ estimateId, locationId, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-estimate', estimateId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);

      const search = params.toString();
      const url = `/api/admin/estimates/${estimateId}${search ? `?${search}` : ''}`;

      // Use Next.js API route instead of direct wpFetch
      // The API route runs server-side and can read httpOnly cookies
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || json?.err || 'Failed to fetch estimate');
      }
      return json;
    },
    enabled: enabled && !!estimateId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

