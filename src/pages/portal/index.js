import Head from "next/head";
import { useRouter } from "next/router";
import { getPortalStatus, getPortalDashboard } from "@/lib/wp";
import { cookieHeader } from "@/components/portal/utils/portal-utils";
import { PortalSidebar } from "@/components/portal/layout/PortalSidebar";
import { OverviewView } from "@/components/portal/views/OverviewView";
import { EstimatesListView } from "@/components/portal/views/EstimatesListView";
import { EstimateDetailView } from "@/components/portal/views/EstimateDetailView";
import { PaymentsView } from "@/components/portal/views/PaymentsView";
import { SupportView } from "@/components/portal/views/SupportView";
import { PreferencesView } from "@/components/portal/views/PreferencesView";
import { InviteTokenBanner } from "@/components/portal/InviteTokenBanner";
import { Spinner } from "@/components/ui/spinner";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { usePortalState } from "@/hooks/usePortalState";
import { ExpiredInviteMessage } from "@/components/portal/ExpiredInviteMessage";

export default function PortalPage({ initialStatus, initialError, initialEstimateId, initialEstimates }) {
  const router = useRouter();
  
  const {
    estimateId,
    inviteToken,
    activeNav,
    view,
    estimates,
    estimateData,
    loading,
    error,
    estimateLoading,
    estimateError,
    handleSelectEstimate,
    handleBackToList,
    handleNavigateToSection,
    handleUploadImages,
    handleViewDetails,
    handleNavigateToPhotos,
    handleNextEstimate,
    handlePrevEstimate,
    currentEstimateIndex,
    resumeEstimate,
    missionSteps,
    photoItems,
    activityFeed,
    activeEstimate,
    overviewEstimate,
    progress,
  } = usePortalState({ initialStatus, initialError, initialEstimateId, initialEstimates });

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
            onNavChange={handleNavigateToSection}
            estimateId={estimateId}
            onBackToList={handleBackToList}
          />

          <section className="flex-1 space-y-6">
            {/* Invite Token Banner */}
            {inviteToken && (
              <InviteTokenBanner />
            )}

            {/* Overview View */}
            {activeNav === "overview" && (
              <>
                {loading || estimateLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : error || estimateError?.message ? (
                  // Check if error is about expired invite token
                  (error?.includes?.('invalid_invite') || 
                   error?.includes?.('expired') || 
                   error?.includes?.('no longer valid') ||
                   estimateError?.message?.includes?.('invalid_invite') ||
                   estimateError?.message?.includes?.('expired') ||
                   estimateError?.message?.includes?.('no longer valid')) ? (
                    <ExpiredInviteMessage 
                      estimateId={estimateId}
                      onRequestNewInvite={async () => {
                        // User would need to contact support
                        // In future, could add API endpoint to request new invite
                      }}
                    />
                  ) : (
                    <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                      <p className="text-lg font-semibold">Error loading estimate</p>
                      <p className="text-sm text-red-600">{error || estimateError?.message}</p>
                    </div>
                  )
                ) : (
                  <OverviewView
                    estimate={overviewEstimate}
                    estimates={estimates}
                    currentEstimateIndex={currentEstimateIndex}
                    onNextEstimate={handleNextEstimate}
                    onPrevEstimate={handlePrevEstimate}
                    onUploadImages={handleUploadImages}
                    onViewDetails={handleViewDetails}
                    onViewAll={!estimateId && estimates.length > 1 ? () => handleNavigateToSection("estimates") : undefined}
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
                  // Check if error is about expired invite token
                  (error?.includes?.('invalid_invite') || 
                   error?.includes?.('expired') || 
                   error?.includes?.('no longer valid')) ? (
                    <ExpiredInviteMessage 
                      estimateId={estimateId}
                      onRequestNewInvite={async () => {
                        // User would need to contact support
                      }}
                    />
                  ) : (
                    <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                      <p className="text-lg font-semibold">Error loading estimate</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )
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

            {/* Payments View */}
            {activeNav === "payments" && <PaymentsView view={view} />}

            {/* Support View */}
            {activeNav === "support" && <SupportView view={view} />}

            {/* Preferences View */}
            {activeNav === "preferences" && <PreferencesView view={view} />}
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
