import { useQuery } from "@tanstack/react-query";

async function fetchAdminDashboard() {
  const res = await fetch("/api/admin/dashboard", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "Failed to load admin dashboard");
  }
  return json;
}

export function useAdminDashboard({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}


