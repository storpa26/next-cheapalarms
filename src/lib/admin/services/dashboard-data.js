/**
 * Dashboard data service for admin overview
 * Handles fetching and processing dashboard statistics
 */

import { wpFetch, WP_API_BASE } from "../../wp.server";
import { cookieHeader, buildAuthHeaders } from "../utils/request-utils";
import { formatTimeAgo } from "../utils/time-utils";

/**
 * Fetches product counts from WordPress API
 * @param {object} req - Next.js request object
 * @returns {Promise<{base: number, addons: number, packages: number}>}
 */
async function fetchProductCounts(req) {
  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE || "http://localhost:10013/wp-json";
  const headers = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(req),
  };

  try {
    const [baseRes, addonsRes, packagesRes] = await Promise.allSettled([
      fetch(`${wpBase}/ca/v1/products/base`, {
        headers,
        credentials: "include",
      }),
      fetch(`${wpBase}/ca/v1/products/addons`, {
        headers,
        credentials: "include",
      }),
      fetch(`${wpBase}/ca/v1/products/packages`, {
        headers,
        credentials: "include",
      }),
    ]);

    const extractCount = async (result) => {
      if (result.status !== "fulfilled" || !result.value.ok) return 0;
      const data = await result.value.json();
      return Array.isArray(data) ? data.length : Array.isArray(data?.items) ? data.items.length : 0;
    };

    const [baseCount, addonsCount, packagesCount] = await Promise.all([
      extractCount(baseRes),
      extractCount(addonsRes),
      extractCount(packagesRes),
    ]);

    return { base: baseCount, addons: addonsCount, packages: packagesCount };
  } catch (error) {
    // Error fetching products - return empty array
    return { base: 0, addons: 0, packages: 0 };
  }
}

/**
 * Calculates statistics from estimates data
 * @param {Array} estimates - Array of estimate objects
 * @param {object} productCounts - Product counts object
 * @returns {Array} Array of stat objects
 */
function calculateStats(estimates, productCounts) {
  const totalEstimates = estimates.length;
  const pendingEstimates = estimates.filter(
    (e) => e.status && !["accepted", "approved"].includes(e.status.toLowerCase())
  ).length;
  const acceptedEstimates = estimates.filter((e) =>
    ["accepted", "approved"].includes((e.status || "").toLowerCase())
  ).length;

  return [
    {
      title: "Total estimates",
      value: totalEstimates.toString(),
      hint: `${acceptedEstimates} accepted`,
    },
    {
      title: "Pending estimates",
      value: pendingEstimates.toString(),
      hint: "Awaiting approval",
    },
    {
      title: "Accepted estimates",
      value: acceptedEstimates.toString(),
      hint: "Ready for installation",
    },
    {
      title: "Products",
      value: `${productCounts.base}/${productCounts.addons}/${productCounts.packages}`,
      hint: "base/addons/packages",
    },
  ];
}

/**
 * Generates alerts from estimates data
 * @param {Array} estimates - Array of estimate objects
 * @returns {Array} Array of alert objects
 */
function generateAlerts(estimates) {
  const alerts = [];
  const totalEstimates = estimates.length;
  const pendingEstimates = estimates.filter(
    (e) => e.status && !["accepted", "approved"].includes(e.status.toLowerCase())
  ).length;
  const estimatesWithInvites = estimates.filter((e) => e.inviteToken);

  if (estimatesWithInvites.length > 0 && pendingEstimates > 10) {
    alerts.push({
      title: `${pendingEstimates} estimates pending`,
      description: "Review and follow up on pending estimates.",
    });
  }

  if (totalEstimates === 0) {
    alerts.push({
      title: "No estimates found",
      description: "Create your first estimate to get started.",
    });
  }

  return alerts;
}

/**
 * Generates activity feed from recent estimates
 * @param {Array} estimates - Array of estimate objects
 * @returns {Array} Array of activity objects
 */
function generateActivity(estimates) {
  return estimates
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((estimate) => {
      const dateStr = estimate.updatedAt || estimate.createdAt;
      const status = estimate.status || "pending";
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

      return {
        title: `Estimate ${statusLabel}`,
        description: estimate.estimateNumber
          ? `#${estimate.estimateNumber}`
          : estimate.email
          ? `for ${estimate.email}`
          : `ID: ${estimate.id}`,
        when: formatTimeAgo(dateStr),
      };
    });
}

/**
 * Fetches and processes all dashboard data
 * @param {object} req - Next.js request object
 * @returns {Promise<{stats: Array, alerts: Array, activity: Array}>}
 */
export async function getDashboardData(req) {
  try {
    // Fetch estimates via admin endpoint (benefits from server-side caching)
    const estimatesData = await wpFetch(`/ca/v1/admin/estimates?page=1&pageSize=100`, {
      headers: cookieHeader(req),
    });

    const estimates = estimatesData?.items ?? [];

    // Fetch product counts in parallel
    const productCounts = await fetchProductCounts(req);

    // Calculate and return dashboard data
    return {
      stats: calculateStats(estimates, productCounts),
      alerts: generateAlerts(estimates),
      activity: generateActivity(estimates),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Returns error state for dashboard
 * @param {string} message - Error message
 * @returns {object} Error state object
 */
export function getDashboardErrorState(message) {
  // Check if it's a permission error
  const isPermissionError = /403|forbidden|insufficient privileges/i.test(message);
  
  return {
    stats: [
      { title: "Total estimates", value: "—", hint: "Error loading" },
      { title: "Pending estimates", value: "—", hint: "Error loading" },
      { title: "Accepted estimates", value: "—", hint: "Error loading" },
      { title: "Products", value: "—", hint: "Error loading" },
    ],
    alerts: [
      {
        title: isPermissionError ? "Access Denied" : "Failed to load data",
        description: message,
      },
    ],
    activity: [],
    error: message,
  };
}

