/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useRouter } from "next/router";
import { startTransition, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { getPortalStatus, getPortalDashboard } from "@/lib/wp";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import Link from "next/link";
import { formatDate, formatCurrency, badgeVariant, cookieHeader } from "@/components/portal/utils/portal-utils";
import { normaliseStatus } from "@/components/portal/utils/status-normalizer";
import {
  mockPortalStatus,
  mockPaymentHistory,
  mockDocumentList,
  mockTaskList,
  mockSupportInfo,
  mockTimelineSteps,
  mockActivityLog,
} from "@/components/portal/utils/mock-data";
import { buildAlerts } from "@/components/portal/utils/build-alerts";
import { OverviewSection } from "@/components/portal/sections/OverviewSection";
import { EstimateSection } from "@/components/portal/sections/EstimateSection";
import { InstallationSection } from "@/components/portal/sections/InstallationSection";
import { PhotoSection } from "@/components/portal/sections/PhotoSection";
import { DocumentSection } from "@/components/portal/sections/DocumentSection";
import { PaymentSection } from "@/components/portal/sections/PaymentSection";
import { TaskSection } from "@/components/portal/sections/TaskSection";
import { SupportSection } from "@/components/portal/sections/SupportSection";
import { ActivitySection } from "@/components/portal/sections/ActivitySection";
import { FAQSection, PortalAccountCard, AccountPreferences } from "@/components/portal/sections/AccountSection";

const SECTION_CONFIG = [
  {
    id: "overview",
    label: "Overview",
    badge: "Portal overview",
    description: "Quick snapshot of your project across estimate, install, and support.",
  },
  {
    id: "estimate",
    label: "Estimate",
    badge: "Estimate",
    description: "Review your proposal details and next actions.",
  },
  {
    id: "installation",
    label: "Installation",
    badge: "Installation",
    description: "Track scheduling milestones and what happens next.",
  },
  {
    id: "tasks",
    label: "Tasks",
    badge: "Checklist",
    description: "Mark off the steps we need before installation.",
  },
  {
    id: "payments",
    label: "Payments",
    badge: "Payments",
    description: "See outstanding balances and payment history.",
  },
  {
    id: "documents",
    label: "Documents",
    badge: "Documents",
    description: "Access your proposal, contract, and supporting paperwork.",
  },
  {
    id: "photos",
    label: "Photos",
    badge: "Site photos",
    description: "Upload or review the photos our install team needs.",
  },
  {
    id: "support",
    label: "Support",
    badge: "Support",
    description: "Reach your CheapAlarms specialist for help or questions.",
  },
  {
    id: "activity",
    label: "Activity",
    badge: "Activity log",
    description: "Timeline of everything that’s happened so far.",
  },
  {
    id: "account",
    label: "Account",
    badge: "Account",
    description: "Manage portal access and notification preferences.",
  },
];

export default function PortalPage({ initialStatus, initialError, initialSection, initialEstimateId, initialLocationId, initialEstimates }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection ?? "overview");
  const [photoTab, setPhotoTab] = useState("uploaded");
  const [taskState, setTaskState] = useState({});
  const [estimates, setEstimates] = useState(initialEstimates || []);
  const [authChecking, setAuthChecking] = useState(true);
  const hasTriedFetch = useRef(false);

  // Safely extract estimateId and locationId from router.query or use initial props
  const estimateId = useMemo(() => {
    if (router.isReady && router.query.estimateId) {
      const val = router.query.estimateId;
      return Array.isArray(val) ? val[0] : val;
    }
    return initialEstimateId || null;
  }, [router.isReady, router.query.estimateId, initialEstimateId]);

  const locationId = useMemo(() => {
    if (router.isReady && router.query.locationId) {
      const val = router.query.locationId;
      return Array.isArray(val) ? val[0] : val;
    }
    return initialLocationId || null;
  }, [router.isReady, router.query.locationId, initialLocationId]);

  const sections = SECTION_CONFIG;
  const currentSectionId =
    router.isReady && typeof router.query.section === "string" && router.query.section !== ""
      ? router.query.section
      : activeSection;
  const currentSection =
    sections.find((section) => section.id === currentSectionId) ?? sections[0];

  useEffect(() => {
    if (!router.isReady) return;
    const routerEstimateId = Array.isArray(router.query.estimateId) 
      ? router.query.estimateId[0] 
      : router.query.estimateId;
    const routerLocationId = Array.isArray(router.query.locationId)
      ? router.query.locationId[0]
      : router.query.locationId;
    const routerInviteToken = Array.isArray(router.query.inviteToken)
      ? router.query.inviteToken[0]
      : router.query.inviteToken;
    
    // Use router query estimateId or fall back to initialEstimateId
    const effectiveEstimateId = routerEstimateId || initialEstimateId;
    if (!effectiveEstimateId || status) return;

    startTransition(() => setLoading(true));
    getPortalStatus(
      {
        estimateId: effectiveEstimateId,
        locationId: routerLocationId || initialLocationId,
        inviteToken: routerInviteToken,
      },
      {
        credentials: "include",
      }
    )
      .then((result) => {
        setStatus(result);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        startTransition(() => setLoading(false));
      });
  }, [router, status, initialEstimateId, initialLocationId]);

  // Check authentication on mount - prevent flash of content for unauthenticated users
  useEffect(() => {
    if (!router.isReady) return;
    
    const routerInviteToken = Array.isArray(router.query.inviteToken) 
      ? router.query.inviteToken[0] 
      : router.query.inviteToken;
    const routerEstimateId = Array.isArray(router.query.estimateId) 
      ? router.query.estimateId[0] 
      : router.query.estimateId;
    
    // If there's an invite token, allow rendering immediately
    if (routerInviteToken) {
      setAuthChecking(false);
      return;
    }
    
    // If we have initialEstimates from SSR, user is authenticated
    if (initialEstimates !== undefined) {
      setAuthChecking(false);
      return;
    }
    
    // If we have initialStatus, user is authenticated (has estimateId)
    if (initialStatus || routerEstimateId) {
      setAuthChecking(false);
      return;
    }
    
    // No invite token and no initial data - need to check auth by fetching dashboard
    // This will either succeed (auth OK) or fail with 401 (redirect to login)
    if (!hasTriedFetch.current) {
      hasTriedFetch.current = true;
      startTransition(() => setLoading(true));
      getPortalDashboard({
        credentials: "include",
      })
        .then((result) => {
          setAuthChecking(false);
          if (result.ok && Array.isArray(result.estimates)) {
            setEstimates(result.estimates);
            setError(null);
          } else {
            const errorMsg = result.err || result.error || "Failed to load estimates";
            setError(errorMsg);
          }
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to load estimates";
          
          // If 401, redirect to login immediately without logging (expected behavior)
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            const from = router.asPath;
            router.push(getLoginRedirect(from));
            return;
          }
          
          // Only log and show non-401 errors
          console.error("Dashboard fetch error:", err);
          setError(errorMessage);
          setAuthChecking(false);
        })
        .finally(() => {
          startTransition(() => setLoading(false));
        });
    }
  }, [router.isReady, router.query.inviteToken, router.query.estimateId, initialEstimates, initialStatus, router]);

  const view = useMemo(() => normaliseStatus(status), [status]);
  const inviteToken = useMemo(() => {
    if (router.isReady && router.query.inviteToken) {
      const val = router.query.inviteToken;
      return Array.isArray(val) ? val[0] : val;
    }
    return null;
  }, [router.isReady, router.query.inviteToken]);
  const errorHint =
    error && /401|unauthor/i.test(error)
      ? "You need a valid invite link or must log in with a WordPress account that has portal access."
      : null;

  const paymentsData = view?.payments ?? mockPaymentHistory();
  const documentsData = view?.documents ?? mockDocumentList();
  const tasksData = view?.tasks ?? mockTaskList();
  const supportData = view?.support ?? mockSupportInfo();
  const timelineData = view?.timeline ?? mockTimelineSteps();
  const activityData = view?.activity ?? mockActivityLog();
  const alerts = useMemo(() => buildAlerts(view, paymentsData), [view, paymentsData]);

  const handleToggleTask = (id) => {
    setTaskState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (sectionId) => {
    if (sectionId === currentSectionId) return;
    setActiveSection(sectionId);
    if (!router.isReady) return;
    const nextQuery = { ...router.query };
    if (sectionId === "overview") {
      delete nextQuery.section;
    } else {
      nextQuery.section = sectionId;
    }
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  // Check if we have an estimateId
  const hasEstimateId = estimateId || initialEstimateId;

  // Show loading state while checking authentication to prevent flash of content
  if (authChecking) {
    return (
      <>
        <Head>
          <title>Customer Portal • CheapAlarms</title>
        </Head>
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Customer Portal • CheapAlarms</title>
      </Head>
      <main className="bg-background text-foreground">
        <div className="flex min-h-screen">
          <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur md:flex">
            <div className="border-b border-border/60 px-6 py-6">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">CheapAlarms</p>
              <p className="mt-3 text-lg font-semibold text-foreground">Customer Portal</p>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {hasEstimateId && (
                <Link href="/portal">
                  <button
                    type="button"
                    className="mb-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                  >
                    ← Back to Estimates
                  </button>
                </Link>
              )}
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleNavigate(section.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    section.id === currentSectionId
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <div className="hidden items-center justify-between gap-3 border-t border-border/60 px-6 py-4 md:flex">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 md:hidden">
              <div className="text-sm font-medium text-muted-foreground">{currentSection.label}</div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <SignOutButton />
              </div>
            </div>
            <div className="px-4 py-8 sm:px-6 lg:px-10">
              <div className="mb-6 overflow-x-auto md:hidden">
                <div className="flex gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleNavigate(section.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                        section.id === currentSectionId
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <Card className="mb-6 border-dashed border-border bg-muted/30 text-muted-foreground">
                  <CardHeader>
                    <CardTitle>Refreshing</CardTitle>
                    <CardDescription>Loading the latest portal status…</CardDescription>
                  </CardHeader>
                </Card>
              ) : null}

              {error ? (
                <Card className="mb-6 border border-primary/40 bg-primary/10 text-primary">
                  <CardHeader>
                    <CardTitle>We hit a snag</CardTitle>
                    <CardDescription className="text-primary/80">{error}</CardDescription>
                    {errorHint ? <p className="text-xs text-primary/60">{errorHint}</p> : null}
                  </CardHeader>
                </Card>
              ) : null}

              {/* Show estimates list on Overview when no estimateId */}
              {!hasEstimateId && currentSectionId === "overview" && (
                <div className="space-y-6">
                  <header className="space-y-3">
                    <h1 className="text-3xl font-bold">My Estimates</h1>
                    <p className="text-muted-foreground">Select an estimate to view details</p>
                  </header>

                  {!loading && !error && estimates.length === 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground">No estimates found.</p>
                      </CardContent>
                    </Card>
                  )}

                  {!loading && !error && estimates.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {estimates.map((estimate) => (
                        <Card key={estimate.estimateId} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle>Estimate #{estimate.number || estimate.estimateId}</CardTitle>
                            <CardDescription>
                              <Badge variant={estimate.status === 'accepted' ? 'default' : 'secondary'}>
                                {estimate.statusLabel}
                              </Badge>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Link href={`/portal/estimate/${estimate.estimateId}${estimate.locationId ? `?locationId=${estimate.locationId}` : ''}`}>
                              <Button className="w-full">View Details</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show empty state for other sections when no estimateId */}
              {!hasEstimateId && currentSectionId !== "overview" && (
                <div className="space-y-8">
                  <header className="space-y-3">
                    <Badge variant="outline" className="uppercase tracking-[0.35em]">
                      {currentSection.badge}
                    </Badge>
                    <h1 className="text-3xl font-bold">{currentSection.label}</h1>
                    <p className="max-w-2xl text-muted-foreground">{currentSection.description}</p>
                  </header>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground">Please select an estimate to view {currentSection.label.toLowerCase()}.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {hasEstimateId && view ? (
                <div className="space-y-8">
                  <header className="space-y-3">
                    <Badge variant="outline" className="uppercase tracking-[0.35em]">
                      {currentSection.badge}
                    </Badge>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <h1 className="text-3xl font-bold">
                        {currentSectionId === "overview"
                          ? "Your installation at a glance"
                          : currentSection.label}
                      </h1>
                      {currentSectionId !== "overview" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigate("overview")}
                          className="self-start sm:self-auto"
                        >
                          Back to overview
                        </Button>
                      ) : null}
                    </div>
                    <p className="max-w-2xl text-muted-foreground">{currentSection.description}</p>
                    {inviteToken ? (
                      <p className="text-xs text-muted-foreground">
                        Invite token provided: <code>{inviteToken}</code>
                      </p>
                    ) : null}
                  </header>

                  {currentSectionId === "overview" ? (
                    <OverviewSection
                      view={view}
                      payments={paymentsData}
                      documents={documentsData}
                      tasks={tasksData}
                      taskState={taskState}
                      onToggleTask={handleToggleTask}
                      support={supportData}
                      alerts={alerts}
                      onNavigate={handleNavigate}
                      timeline={timelineData}
                    />
                  ) : null}

                  {currentSectionId === "estimate" ? <EstimateSection view={view} /> : null}

                  {currentSectionId === "installation" ? (
                    <InstallationSection view={view} timeline={timelineData} />
                  ) : null}

                  {currentSectionId === "tasks" ? (
                    <TaskSection tasks={tasksData} taskState={taskState} setTaskState={setTaskState} />
                  ) : null}

                  {currentSectionId === "payments" ? <PaymentSection payments={paymentsData} /> : null}

                  {currentSectionId === "documents" ? <DocumentSection documents={documentsData} /> : null}

                  {currentSectionId === "photos" ? (
                    <PhotoSection
                      photos={view.photos}
                      photoTab={photoTab}
                      setPhotoTab={setPhotoTab}
                      estimateId={estimateId}
                      locationId={locationId}
                    />
                  ) : null}

                  {currentSectionId === "support" ? (
                    <div className="space-y-6">
                      <SupportSection support={supportData} />
                      <FAQSection />
                    </div>
                  ) : null}

                  {currentSectionId === "activity" ? <ActivitySection entries={activityData} /> : null}

                  {currentSectionId === "account" ? (
                    <div className="space-y-6">
                      <PortalAccountCard view={view} />
                      <AccountPreferences />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

PortalPage.getInitialProps = async ({ query, req }) => {
  const estimateId = Array.isArray(query.estimateId) ? query.estimateId[0] : query.estimateId;
  const locationId = Array.isArray(query.locationId) ? query.locationId[0] : query.locationId;
  const inviteToken = Array.isArray(query.inviteToken) ? query.inviteToken[0] : query.inviteToken;
  const initialSection =
    typeof query.section === "string" && query.section !== "" ? query.section : "overview";

  // Check authentication: if no invite token and not authenticated, redirect to login
  // Note: getInitialProps doesn't support redirects directly, so we'll handle this client-side
  // But we can check here and pass a flag
  const needsAuth = !inviteToken && req && !isAuthenticated(req);

  // If no estimateId, fetch dashboard
  if (!estimateId) {
    try {
      const dashboard = await getPortalDashboard({
        headers: cookieHeader(req),
      });
      // If dashboard fetch succeeded, return the estimates
      if (dashboard.ok && Array.isArray(dashboard.estimates)) {
        return {
          initialStatus: null,
          initialError: null,
          initialSection,
          initialEstimateId: null,
          initialLocationId: null,
          initialEstimates: dashboard.estimates,
        };
      }
      // If dashboard returned but not ok, return empty (client will retry)
      return {
        initialStatus: null,
        initialError: null,
        initialSection,
        initialEstimateId: null,
        initialLocationId: null,
        initialEstimates: [],
      };
    } catch (error) {
      // If SSR fetch fails (e.g., 401, 404), let client-side handle it
      // Return undefined for initialEstimates so client-side will retry
      return {
        initialStatus: null,
        initialError: null,
        initialSection,
        initialEstimateId: null,
        initialLocationId: null,
        initialEstimates: undefined, // undefined triggers client-side retry
      };
    }
  }

  if (query.__mock === "1") {
    return {
      initialStatus: mockPortalStatus(estimateId, locationId),
      initialError: null,
      initialSection,
      initialEstimateId: estimateId,
      initialLocationId: locationId || null,
    };
  }

  try {
    const status = await getPortalStatus(
      {
        estimateId,
        locationId: locationId || undefined,
        inviteToken: Array.isArray(query.inviteToken) ? query.inviteToken[0] : query.inviteToken,
      },
      {
        headers: cookieHeader(req),
      }
    );
    return { 
      initialStatus: status, 
      initialError: null, 
      initialSection,
      initialEstimateId: estimateId,
      initialLocationId: locationId || null,
    };
  } catch (error) {
    return {
      initialStatus: null,
      initialError: error instanceof Error ? error.message : "Unknown error",
      initialSection,
      initialEstimateId: estimateId,
      initialLocationId: locationId || null,
    };
  }
};





