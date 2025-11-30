import { useRouter } from "next/router";
import { useEffect, useMemo, useCallback } from "react";
import { usePortalStatus, usePortalDashboard, useEstimate } from "@/lib/react-query/hooks";
import { normaliseStatus } from "@/components/portal/utils/status-normalizer";
import { formatAddress } from "@/components/portal/utils/portal-utils";

/**
 * Custom hook to manage all portal state and data fetching
 */
export function usePortalState({ initialStatus, initialError, initialEstimateId, initialEstimates }) {
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

  // Navigation handlers
  const handleSelectEstimate = useCallback(
    (nextEstimateId) => {
      if (!nextEstimateId) return;
      const params = new URLSearchParams();
      params.set("estimateId", nextEstimateId);
      params.set("section", "estimates");
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

  const handleNavigateToSection = useCallback(
    (section) => {
      const params = new URLSearchParams();
      if (estimateId) {
        params.set("estimateId", estimateId);
      }
      params.set("section", section);
      if (inviteToken) {
        params.set("inviteToken", inviteToken);
      }
      const queryString = params.toString();
      router.push(`/portal${queryString ? `?${queryString}` : ""}`, undefined, { shallow: true });
    },
    [router, estimateId, inviteToken]
  );

  // Resume estimate (last viewed or first)
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
      if (resumeEstimate) {
        handleSelectEstimate(resumeEstimate.estimateId || resumeEstimate.id);
      }
      return;
    }
    handleNavigateToSection("estimates");
  }, [estimateId, resumeEstimate, handleSelectEstimate, handleNavigateToSection]);

  const handleViewDetails = useCallback(() => {
    if (!estimateId) return;
    handleNavigateToSection("estimates");
  }, [estimateId, handleNavigateToSection]);

  const handleNavigateToPhotos = useCallback(() => {
    if (!estimateId) return;
    handleNavigateToSection("estimates");
  }, [estimateId, handleNavigateToSection]);

  // Computed values
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

  const photoItems = useMemo(() => {
    const items = estimateData?.ok ? estimateData.items || [] : [];
    
    if (items.length === 0) return [];
    
    const uploadedPhotos = view?.photos?.items || [];
    const photoCountsByItem = {};
    uploadedPhotos.forEach((photo) => {
      const itemName = photo.itemName || "Unknown";
      photoCountsByItem[itemName] = (photoCountsByItem[itemName] || 0) + 1;
    });
    
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

  const activityFeed = useMemo(() => {
    if (!view?.activity) return [];
    return Array.isArray(view.activity) ? view.activity.slice(0, 5) : [];
  }, [view]);

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

  const overviewEstimate = useMemo(() => {
    if (!estimateId || !estimateData?.ok) {
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

  const progress = useMemo(() => {
    if (!view) return 0;
    let p = 0;
    if (view.quote?.status === "accepted") p = 82;
    else if (view.photos?.items?.length > 0) p = 56;
    else if (view.quote) p = 32;
    return p;
  }, [view]);

  return {
    // Router state
    estimateId,
    inviteToken,
    activeNav,
    
    // Data
    view,
    estimates,
    estimateData,
    
    // Loading/Error states
    loading,
    error,
    estimateLoading,
    estimateError,
    
    // Navigation handlers
    handleSelectEstimate,
    handleBackToList,
    handleNavigateToSection,
    handleUploadImages,
    handleViewDetails,
    handleNavigateToPhotos,
    
    // Computed values
    resumeEstimate,
    missionSteps,
    photoItems,
    activityFeed,
    activeEstimate,
    overviewEstimate,
    progress,
  };
}

