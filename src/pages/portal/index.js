import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getPortalStatus, getPortalDashboard } from "@/lib/wp";
import { usePortalStatus, usePortalDashboard, useEstimate } from "@/lib/react-query/hooks";
import { normaliseStatus } from "@/components/portal/utils/status-normalizer";
import { cookieHeader, formatAddress } from "@/components/portal/utils/portal-utils";
import { PortalSidebar } from "@/components/portal/layout/PortalSidebar";
import { OverviewView } from "@/components/portal/views/OverviewView";
import { EstimatesListView } from "@/components/portal/views/EstimatesListView";
import { EstimateDetailView } from "@/components/portal/views/EstimateDetailView";
import { Spinner } from "@/components/ui/spinner";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";

export default function PortalPage({ initialStatus, initialError, initialEstimateId, initialEstimates }) {
  const router = useRouter();
  
  // Extract estimateId from URL
  const estimateId = useMemo(() => {
    if (router.isReady && router.query.estimateId) {
      const val = router.query.estimateId;
      return Array.isArray(val) ? val[0] : val;
    }
    return initialEstimateId || null;
  }, [router.isReady, router.query.estimateId, initialEstimateId]);

  // Extract section from URL
  const sectionFromUrl = useMemo(() => {
    if (router.isReady && router.query.section) {
      const val = router.query.section;
      return Array.isArray(val) ? val[0] : val;
    }
    return null;
  }, [router.isReady, router.query.section]);

  // Derive activeNav from URL - URL is the source of truth
  const activeNav = useMemo(() => {
    if (sectionFromUrl) {
      return sectionFromUrl;
    }
    // If estimateId exists but no section, default to estimates detail view
    // (This handles legacy URLs or direct navigation to estimate without section)
    if (estimateId) {
      return "estimates";
    }
    // Otherwise default to overview
    return "overview";
  }, [sectionFromUrl, estimateId]);

  const inviteToken = useMemo(() => {
    if (router.isReady && router.query.inviteToken) {
      const val = router.query.inviteToken;
      return Array.isArray(val) ? val[0] : val;
    }
    return null;
  }, [router.isReady, router.query.inviteToken]);

  // Fetch portal status when estimateId exists
  const {
    data: statusData,
    error: statusError,
    isLoading: statusLoading,
  } = usePortalStatus({
    estimateId: estimateId || null,
    inviteToken: inviteToken || null,
    enabled: !!estimateId && router.isReady,
    initialData: initialStatus,
  });

  // Fetch full estimate data for Overview (with items/pricing)
  const {
    data: estimateData,
    error: estimateError,
    isLoading: estimateLoading,
  } = useEstimate({
    estimateId: estimateId || null,
    inviteToken: inviteToken || null,
    enabled: !!estimateId && router.isReady,
    initialData: null,
  });

  // Fetch dashboard when no estimateId
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
  } = usePortalDashboard({
    enabled: !estimateId && router.isReady,
    initialData: initialEstimates ? { ok: true, estimates: initialEstimates } : undefined,
  });

  const view = useMemo(() => normaliseStatus(statusData), [statusData]);
  const estimates = useMemo(() => {
    if (estimateId) return [];
    if (dashboardData?.ok && Array.isArray(dashboardData.estimates)) {
      return dashboardData.estimates;
    }
    if (Array.isArray(initialEstimates)) {
      return initialEstimates;
    }
    return [];
  }, [estimateId, dashboardData, initialEstimates]);

  const loading = estimateId ? statusLoading : dashboardLoading;
  const error = estimateId ? statusError?.message : dashboardError?.message || initialError;

  // Get last viewed estimate from localStorage
  const lastViewedEstimateId = useMemo(() => {
    if (estimateId) return estimateId;
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("ca_last_estimate");
    }
    return null;
  }, [estimateId]);

  // Save estimateId to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined" || !estimateId) return;
    window.localStorage.setItem("ca_last_estimate", String(estimateId));
  }, [estimateId]);

  const handleSelectEstimate = useCallback(
    (nextEstimateId) => {
      if (!nextEstimateId) return;
      const params = new URLSearchParams();
      params.set("estimateId", nextEstimateId);
      params.set("section", "estimates"); // Navigate to estimates detail view
      if (inviteToken) {
        params.set("inviteToken", inviteToken);
      }
      router.push(`/portal?${params.toString()}`);
    },
    [router, inviteToken]
  );

  const handleBackToList = useCallback(() => {
    const params = new URLSearchParams();
    if (inviteToken) {
      params.set("inviteToken", inviteToken);
    }
    router.push(`/portal${params.toString() ? `?${params.toString()}` : ""}`);
  }, [router, inviteToken]);

  // Resume estimate (last viewed or first) - moved before callbacks that use it
  const resumeEstimate = useMemo(() => {
    if (estimates.length === 0) return null;
    if (lastViewedEstimateId) {
      const found = estimates.find(
        (e) => (e?.estimateId ?? e?.id)?.toString() === lastViewedEstimateId.toString()
      );
      if (found) return found;
    }
    return estimates[0];
  }, [estimates, lastViewedEstimateId]);

  const handleUploadImages = useCallback(() => {
    if (!estimateId) {
      // If no estimateId, select the resume estimate first
      if (resumeEstimate) {
        handleSelectEstimate(resumeEstimate.estimateId || resumeEstimate.id);
      }
      return;
    }
    // Navigate to estimates detail view (photos will be shown there)
    const params = new URLSearchParams();
    params.set("estimateId", estimateId);
    params.set("section", "estimates");
    if (inviteToken) {
      params.set("inviteToken", inviteToken);
    }
    router.push(`/portal?${params.toString()}`);
  }, [router, estimateId, inviteToken, resumeEstimate, handleSelectEstimate]);

  const handleViewDetails = useCallback(() => {
    if (!estimateId) return;
    const params = new URLSearchParams();
    params.set("estimateId", estimateId);
    params.set("section", "estimates");
    if (inviteToken) {
      params.set("inviteToken", inviteToken);
    }
    router.push(`/portal?${params.toString()}`);
  }, [router, estimateId, inviteToken]);

  // Helper to navigate to photos section (updates URL)
  const handleNavigateToPhotos = useCallback(() => {
    if (!estimateId) return;
    const params = new URLSearchParams();
    params.set("estimateId", estimateId);
    params.set("section", "estimates");
    if (inviteToken) {
      params.set("inviteToken", inviteToken);
    }
    router.push(`/portal?${params.toString()}`, undefined, { shallow: true });
  }, [router, estimateId, inviteToken]);

  // Build mission steps from view data
  const missionSteps = useMemo(() => {
    if (!view) return [];
    const quoteAccepted = view.quote?.status === "accepted";
    const photosUploaded = (view.photos?.items?.length || 0) > 0;
    return [
      { label: "Select Project", caption: "Choose the site you're working on", done: true },
      { label: "Review & Adjust", caption: "Confirm devices + notes", done: true },
      { label: "Upload Photos", caption: "Snap the highlighted areas", done: photosUploaded },
      { label: "Approve & Pay", caption: "Unlock once pricing updated", done: quoteAccepted },
      { label: "Install Day", caption: "Crew waits for your approval", done: false },
    ];
  }, [view]);

  // Build photo items from estimate items (all addons/products)
  const photoItems = useMemo(() => {
    // Get items from estimateData (full estimate) or fallback to view
    const items = estimateData?.ok ? estimateData.items || [] : [];
    
    if (items.length === 0) return [];
    
    // Get uploaded photos count per item
    const uploadedPhotos = view?.photos?.items || [];
    const photoCountsByItem = {};
    uploadedPhotos.forEach((photo) => {
      const itemName = photo.itemName || "Unknown";
      photoCountsByItem[itemName] = (photoCountsByItem[itemName] || 0) + 1;
    });
    
    // Build items list with status
    const grouped = {};
    items.forEach((item) => {
      const itemName = item.name || "Unknown Item";
      const qty = item.qty || item.quantity || 1;
      if (!grouped[itemName]) {
        const uploadedCount = photoCountsByItem[itemName] || 0;
        grouped[itemName] = {
          label: itemName,
          quantity: 0,
          status: uploadedCount > 0 ? "Uploaded" : "Pending",
          uploadedCount: uploadedCount,
        };
      }
      grouped[itemName].quantity += qty;
    });
    
    return Object.values(grouped);
  }, [estimateData, view]);

  // Build activity feed from view data
  const activityFeed = useMemo(() => {
    if (!view?.activity) return [];
    return Array.isArray(view.activity) ? view.activity.slice(0, 5) : [];
  }, [view]);

  // Get active estimate summary for detail view
  const activeEstimate = useMemo(() => {
    if (!estimateId || !view) return null;
    const hasPhotos = (view.photos?.items?.length || 0) > 0;
    return {
      id: estimateId,
      label: view.quote?.number || `Estimate #${estimateId}`,
      status: view.quote?.statusLabel || view.quote?.status || "Pending",
      progress: view.quote?.status === "accepted" ? 82 : hasPhotos ? 56 : 32,
      total: estimateData?.ok ? estimateData.total : view.quote?.total || null,
      hasPhotos,
      meta: {
        address: formatAddress(view.installation?.address) || "Site address pending",
        package: view.quote?.packageName || "Base package",
        customer: view.account?.email || "Customer",
      },
    };
  }, [estimateId, view, estimateData]);

  // Get estimate for Overview (with full data)
  const overviewEstimate = useMemo(() => {
    if (!estimateId || !estimateData?.ok) {
      // Fallback to first estimate from list if no estimateId
      if (estimates.length > 0) {
        const first = estimates[0];
        return {
          estimateId: first.estimateId || first.id,
          number: first.number || first.estimateNumber,
          statusLabel: first.statusLabel || first.status,
          status: first.status,
          address: first.address || first.meta?.address,
          photosCount: first.photosCount || 0,
          items: [],
          subtotal: 0,
          taxTotal: 0,
          total: 0,
        };
      }
      return null;
    }
    return {
      estimateId: estimateData.estimateId,
      number: estimateData.estimateNumber || estimateData.estimateId,
      statusLabel: estimateData.status || "Pending",
      status: estimateData.status,
      address: formatAddress(estimateData.contact?.address) || "Site address pending",
      photosCount: view?.photos?.items?.length || 0,
      items: estimateData.items || [],
      subtotal: estimateData.subtotal || 0,
      taxTotal: estimateData.taxTotal || 0,
      total: estimateData.total || 0,
      label: estimateData.title || `Estimate #${estimateData.estimateNumber || estimateData.estimateId}`,
    };
  }, [estimateId, estimateData, estimates, view]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (!view) return 0;
    let p = 0;
    if (view.quote?.status === "accepted") p = 82;
    else if (view.photos?.items?.length > 0) p = 56;
    else if (view.quote) p = 32;
    return p;
  }, [view]);

  return (
    <>
      <Head>
        <title>Customer Portal • CheapAlarms</title>
      </Head>
      <main className="min-h-screen bg-[#f7f8fd] text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,83,117,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(47,182,201,0.18),transparent_50%)]" />
        </div>
        <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-10">
          <PortalSidebar
            activeNav={activeNav}
            onNavChange={(nav) => {
              // Update URL to reflect navigation change
              const params = new URLSearchParams();
              if (estimateId) {
                params.set("estimateId", estimateId);
              }
              // Always set section, even for overview, so URL is explicit
              params.set("section", nav);
              if (inviteToken) {
                params.set("inviteToken", inviteToken);
              }
              const queryString = params.toString();
              router.push(`/portal${queryString ? `?${queryString}` : ""}`, undefined, { shallow: true });
            }}
            estimateId={estimateId}
            onBackToList={handleBackToList}
          />

          <section className="flex-1 space-y-6">
            {/* Overview View */}
            {activeNav === "overview" && (
              <>
                {loading || estimateLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : error || estimateError?.message ? (
                  <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                    <p className="text-lg font-semibold">Error loading estimate</p>
                    <p className="text-sm text-red-600">{error || estimateError?.message}</p>
                  </div>
                ) : (
                  <OverviewView
                    estimate={overviewEstimate}
                    onUploadImages={handleUploadImages}
                    onViewDetails={handleViewDetails}
                    onViewAll={!estimateId && estimates.length > 1 ? () => {
                      const params = new URLSearchParams();
                      params.set("section", "estimates");
                      if (inviteToken) {
                        params.set("inviteToken", inviteToken);
                      }
                      router.push(`/portal?${params.toString()}`);
                    } : undefined}
                  />
                )}
              </>
            )}

            {/* Estimates View */}
            {activeNav === "estimates" && (
              <>
                {!estimateId ? (
                  <EstimatesListView
                    estimates={estimates}
                    loading={loading}
                    error={error}
                    onSelectEstimate={handleSelectEstimate}
                    resumeEstimate={resumeEstimate}
                  />
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                    <p className="text-lg font-semibold">Error loading estimate</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : activeEstimate ? (
                  <EstimateDetailView
                    estimate={activeEstimate}
                    progress={progress}
                    view={view}
                    photoItems={photoItems}
                    missionSteps={missionSteps}
                    activityFeed={activityFeed}
                    estimates={estimates}
                    estimateId={estimateId}
                    estimateData={estimateData}
                    onBackToList={handleBackToList}
                    onSelectEstimate={handleSelectEstimate}
                    onNavigateToPhotos={handleNavigateToPhotos}
                  />
                ) : (
                  <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                    <h2 className="text-2xl font-semibold text-slate-900">Estimate unavailable</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      We couldn’t load that estimate. Refresh the page or request a new invite link from your concierge.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      (If you see this often, check that you’re logged in or that the invite token is still valid.)
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Payments View - Placeholder */}
            {activeNav === "payments" && (
              <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] text-center">
                <h2 className="text-2xl font-semibold text-slate-900">Payments</h2>
                <p className="mt-2 text-slate-500">Payment history and balances coming soon.</p>
              </div>
            )}

            {/* Support View - Placeholder */}
            {activeNav === "support" && (
              <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] text-center">
                <h2 className="text-2xl font-semibold text-slate-900">Support</h2>
                <p className="mt-2 text-slate-500">Support resources coming soon.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ query, req }) {
  const estimateId = Array.isArray(query.estimateId) ? query.estimateId[0] : query.estimateId;
  const inviteToken = Array.isArray(query.inviteToken) ? query.inviteToken[0] : query.inviteToken;

  const hasAuth = isAuthenticated(req);

  // If no estimateId (dashboard view), require authentication
  if (!estimateId) {
    if (!hasAuth) {
      // Redirect to login if not authenticated
      return {
        redirect: {
          destination: getLoginRedirect("/portal"),
          permanent: false,
        },
      };
    }

    // User is authenticated, fetch dashboard
    try {
      const dashboard = await getPortalDashboard({
        headers: cookieHeader(req),
      });
      if (dashboard.ok && Array.isArray(dashboard.estimates)) {
        return {
          props: {
            initialStatus: null,
            initialError: null,
            initialEstimateId: null,
            initialEstimates: dashboard.estimates,
          },
        };
      }
      return {
        props: {
          initialStatus: null,
          initialError: null,
          initialEstimateId: null,
          initialEstimates: [],
        },
      };
    } catch (error) {
      // Check if it's an authentication error
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      if (errorMsg.includes("401") || errorMsg.includes("Authentication")) {
        return {
          redirect: {
            destination: getLoginRedirect("/portal"),
            permanent: false,
          },
        };
      }
      return {
        props: {
          initialStatus: null,
          initialError: null,
          initialEstimateId: null,
          initialEstimates: null,
        },
      };
    }
  }

  // If estimateId exists, allow access with either auth OR inviteToken
  // If neither is present, redirect to login
  if (!hasAuth && !inviteToken) {
    return {
      redirect: {
        destination: getLoginRedirect(`/portal?estimateId=${estimateId}`),
        permanent: false,
      },
    };
  }

  try {
    const status = await getPortalStatus(
      {
        estimateId,
        inviteToken,
      },
      {
        headers: cookieHeader(req),
      }
    );
    return {
      props: {
        initialStatus: status,
        initialError: null,
        initialEstimateId: estimateId,
        initialEstimates: null,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    // Check if it's an authentication error
    if (errorMsg.includes("401") || errorMsg.includes("Authentication")) {
      return {
        redirect: {
          destination: getLoginRedirect(`/portal?estimateId=${estimateId}`),
          permanent: false,
        },
      };
    }
    
    return {
      props: {
        initialStatus: null,
        initialError: errorMsg,
        initialEstimateId: estimateId,
        initialEstimates: null,
      },
    };
  }
}
