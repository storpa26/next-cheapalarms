/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useRouter } from "next/router";
import { startTransition, useEffect, useMemo, useState } from "react";
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
import { getPortalStatus } from "@/lib/wp";

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

export default function PortalPage({ initialStatus, initialError, initialSection }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection ?? "overview");
  const [photoTab, setPhotoTab] = useState("uploaded");
  const [taskState, setTaskState] = useState({});

  const sections = SECTION_CONFIG;
  const currentSectionId =
    router.isReady && typeof router.query.section === "string" && router.query.section !== ""
      ? router.query.section
      : activeSection;
  const currentSection =
    sections.find((section) => section.id === currentSectionId) ?? sections[0];

  useEffect(() => {
    if (!router.isReady) return;
    const { estimateId, locationId, inviteToken } = router.query;
    if (!estimateId || status) return;

    startTransition(() => setLoading(true));
    getPortalStatus(
      {
        estimateId,
        locationId,
        inviteToken,
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
  }, [router, status]);

  const view = useMemo(() => normaliseStatus(status), [status]);
  const inviteToken = typeof router.query.inviteToken === "string" ? router.query.inviteToken : null;
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

              {view ? (
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
                    <OverviewDashboard
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

                  {currentSectionId === "estimate" ? <EstimateDetail view={view} /> : null}

                  {currentSectionId === "installation" ? (
                    <InstallationDetail view={view} timeline={timelineData} />
                  ) : null}

                  {currentSectionId === "tasks" ? (
                    <TaskSection tasks={tasksData} taskState={taskState} setTaskState={setTaskState} />
                  ) : null}

                  {currentSectionId === "payments" ? <PaymentSection payments={paymentsData} /> : null}

                  {currentSectionId === "documents" ? <DocumentSection documents={documentsData} /> : null}

                  {currentSectionId === "photos" ? (
                    <PhotoSection photos={view.photos} photoTab={photoTab} setPhotoTab={setPhotoTab} />
                  ) : null}

                  {currentSectionId === "support" ? (
                    <div className="space-y-6">
                      <SupportSection support={supportData} />
                      <FAQSection />
                    </div>
                  ) : null}

                  {currentSectionId === "activity" ? <ActivityLog entries={activityData} /> : null}

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
  const estimateId = query.estimateId;
  const initialSection =
    typeof query.section === "string" && query.section !== "" ? query.section : "overview";

  if (!estimateId) {
    return { initialStatus: null, initialError: "estimateId is required.", initialSection };
  }

  if (query.__mock === "1") {
    return {
      initialStatus: mockPortalStatus(estimateId, query.locationId),
      initialError: null,
      initialSection,
    };
  }

  try {
    const status = await getPortalStatus(
      {
        estimateId,
        locationId: query.locationId,
        inviteToken: query.inviteToken,
      },
      {
        headers: cookieHeader(req),
      }
    );
    return { initialStatus: status, initialError: null, initialSection };
  } catch (error) {
    return {
      initialStatus: null,
      initialError: error instanceof Error ? error.message : "Unknown error",
      initialSection,
    };
  }
};

function OverviewDashboard({
  view,
  payments,
  documents,
  tasks,
  taskState,
  onToggleTask,
  support,
  alerts,
  onNavigate,
  timeline,
}) {
  const photoItems = Array.isArray(view.photos?.items) ? view.photos.items : [];
  const uploaded = photoItems.length;
  const missing = view.photos?.missingCount ?? 0;
  const required = view.photos?.required ?? uploaded + missing;
  const documentsList = Array.isArray(documents) ? documents : [];
  const recentDocuments = documentsList.slice(0, 2);
  const tasksList = Array.isArray(tasks) ? tasks.slice(0, 3) : [];
  const outstanding = payments?.outstanding ?? 0;
  const timelineSteps = Array.isArray(timeline) ? timeline : [];
  const nextTimelineStep = timelineSteps.find((step) => !step.complete) ?? null;
  const scheduledLabel = view.installation?.scheduledFor
    ? formatDate(view.installation.scheduledFor)
    : "Not yet scheduled";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Estimate {view.estimateId ?? "—"}</CardTitle>
              <CardDescription>{view.quote.label}</CardDescription>
            </div>
            <Badge variant={badgeVariant(view.quote.status)}>{view.quote.label}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/70">Next step</p>
              <p className="mt-1 text-base font-semibold text-foreground">{view.nextStep}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/70">Quote number</p>
              <p className="mt-1 font-medium text-foreground">{view.quote.number}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => onNavigate("estimate")}>
                View estimate
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate("documents")}>
                Documents
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Things that need your attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {alerts.length ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-border/60 bg-background p-3 text-left shadow-sm"
                >
                  <p className="font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground/80">{alert.description}</p>
                  {alert.section ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 text-primary"
                      onClick={() => onNavigate(alert.section)}
                    >
                      {alert.actionLabel ?? "Review"}
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <p>All caught up—no outstanding alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Installation</CardTitle>
              <CardDescription>Upcoming milestone and schedule.</CardDescription>
            </div>
            <Badge variant={badgeVariant(view.installation.status)}>{view.installation.label}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/70">Next milestone</p>
              <p className="mt-1 font-medium text-foreground">
                {nextTimelineStep ? nextTimelineStep.title : view.nextStep}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/70">Scheduled</p>
              <p className="mt-1 font-medium text-foreground">{scheduledLabel}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("installation")}>
              View schedule
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Outstanding balance and receipts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <span>Outstanding</span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(outstanding)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onNavigate("payments")} disabled={outstanding <= 0}>
                {outstanding > 0 ? "Pay now" : "Paid"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate("payments")}>
                View history
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Checklist</CardTitle>
            <Button variant="link" size="sm" onClick={() => onNavigate("tasks")}>
              View all tasks
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {tasksList.length ? (
              tasksList.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`flex w-full items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:border-secondary ${
                    taskState[task.id] ? "bg-secondary/20 text-foreground" : ""
                  }`}
                >
                  <span
                    className={`mt-1 inline-flex size-5 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                      taskState[task.id] ? "border-secondary bg-secondary text-secondary-foreground" : ""
                    }`}
                  >
                    {taskState[task.id] ? "✓" : ""}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground/80">{task.description}</p>
                  </div>
                </button>
              ))
            ) : (
              <p>Nothing outstanding right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site photos</CardTitle>
            <CardDescription>
              {uploaded}/{required} received
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {missing > 0
                ? `${missing} photo${missing === 1 ? "" : "s"} still needed before installation.`
                : "All required photos received. Thanks!"}
            </p>
            <Button variant="outline" size="sm" onClick={() => onNavigate("photos")}>
              Manage photos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Your CheapAlarms specialist.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{support.specialist.name}</p>
              <p className="text-xs text-muted-foreground/80">{support.specialist.role}</p>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground/80">
              <p>{support.specialist.email}</p>
              <p>{support.specialist.phone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("support")}>
              Contact support
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Latest paperwork ready to download.</CardDescription>
          </div>
          <Button variant="link" size="sm" onClick={() => onNavigate("documents")}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {recentDocuments.length ? (
            recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground/80">{formatDate(doc.updatedAt)}</p>
                </div>
                <Badge variant={doc.signed ? "secondary" : "outline"}>
                  {doc.signed ? "Signed" : "Pending"}
                </Badge>
              </div>
            ))
          ) : (
            <p>No documents ready yet—check back soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EstimateDetail({ view }) {
  return (
    <div className="space-y-6">
      <EstimateCard view={view} />
    </div>
  );
}

function EstimateCard({ view }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Estimate</CardTitle>
          <CardDescription>Estimate {view.estimateId ?? "—"}</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.quote.status)}>{view.quote.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Quote number" value={view.quote.number} />
        <Detail label="Next step" value={view.nextStep} />
        <Detail label="Accepted on" value={formatDate(view.quote.acceptedAt)} />
      </CardContent>
    </Card>
  );
}

function PortalAccountCard({ view }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Portal access</CardTitle>
          <CardDescription>Manage customer access to the dashboard.</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.account.status)}>{view.account.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Invite last sent" value={formatDate(view.account.lastInviteAt)} />
        <Detail label="Invite expires" value={formatDate(view.account.expiresAt)} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            disabled={!view.account.portalUrl}
            asChild={Boolean(view.account.portalUrl)}
          >
            {view.account.portalUrl ? (
              <a href={view.account.portalUrl} target="_blank" rel="noreferrer">
                Open portal
              </a>
            ) : (
              <span>Portal link unavailable</span>
            )}
          </Button>
          {view.account.resetUrl ? (
            <Button variant="ghost" asChild>
              <a href={view.account.resetUrl} target="_blank" rel="noreferrer">
                Password reset link
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function InstallationDetail({ view, timeline }) {
  return (
    <div className="space-y-6">
      <InstallationSummaryCard view={view} />
      <InstallationTimeline timeline={timeline} />
    </div>
  );
}

function InstallationSummaryCard({ view }) {
  const scheduleLabel = view.installation?.scheduledFor
    ? formatDate(view.installation.scheduledFor)
    : "Not yet scheduled";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Installation</CardTitle>
          <CardDescription>{view.installation.message ?? "Scheduling details"}</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.installation.status)}>{view.installation.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Scheduled for" value={scheduleLabel} />
        <Detail label="Ready to schedule" value={view.installation.canSchedule ? "Yes" : "No"} />
      </CardContent>
    </Card>
  );
}
function buildAlerts(view, payments) {
  if (!view) return [];
  const items = [];
  const missing = view.photos?.missingCount ?? 0;
  if (missing > 0) {
    items.push({
      id: "photos",
      title: `${missing} photo${missing === 1 ? "" : "s"} missing`,
      description: "Upload the remaining site photos so we can prepare for installation.",
      actionLabel: "Add photos",
      section: "photos",
    });
  }
  if (!view.quote?.acceptedAt) {
    items.push({
      id: "estimate",
      title: "Estimate awaiting approval",
      description: "Review and accept your proposal to move forward with installation.",
      actionLabel: "Review estimate",
      section: "estimate",
    });
  }
  const outstanding = payments?.outstanding ?? 0;
  if (outstanding > 0) {
    items.push({
      id: "payments",
      title: "Payment due",
      description: `${formatCurrency(outstanding)} outstanding balance ready to pay.`,
      actionLabel: "Pay now",
      section: "payments",
    });
  }
  return items;
}
function cookieHeader(req) {
  const cookie = req?.headers?.cookie;
  return cookie ? { Cookie: cookie } : {};
}

function normaliseStatus(status) {
  if (!status) return null;
  const quote = status.quote ?? {};
  const account = status.account ?? {};
  const installation = status.installation ?? {};
  const photos = status.photos ?? {};

  return {
    estimateId: status.estimateId ?? quote.number ?? null,
    nextStep: status.nextStep ?? installation.message ?? "We'll keep you posted.",
    quote: {
      status: quote.status ?? "pending",
      label: quote.statusLabel ?? "Awaiting approval",
      number: quote.number ?? status.estimateId ?? "—",
      acceptedAt: quote.acceptedAt ?? null,
    },
    account: {
      status: account.status ?? "pending",
      label: account.statusLabel ?? "Invite pending",
      lastInviteAt: account.lastInviteAt ?? null,
      expiresAt: account.expiresAt ?? null,
      portalUrl: account.portalUrl ?? null,
      resetUrl: account.resetUrl ?? null,
    },
    installation: {
      status: installation.status ?? "pending",
      label: installation.statusLabel ?? "Not scheduled",
      message: installation.message ?? null,
      canSchedule: installation.canSchedule ?? false,
      scheduledFor: installation.scheduledFor ?? null,
    },
    photos: {
      items: Array.isArray(photos.items) ? photos.items : [],
      missingCount:
        photos.missingCount ??
        Math.max(
          0,
          (photos.required ?? 0) - (Array.isArray(photos.items) ? photos.items.length : 0)
        ),
      required: photos.required ?? 6,
      samples: photos.samples ?? mockSamplePhotos(),
    },
    payments: status.payments ?? null,
    documents: status.documents ?? null,
    tasks: status.tasks ?? null,
    support: status.support ?? null,
    activity: status.activity ?? null,
    timeline: installation.timeline ?? null,
  };
}

function badgeVariant(status) {
  const normalized = (status ?? "").toLowerCase();
  if (["accepted", "active", "scheduled"].includes(normalized)) {
    return "secondary";
  }
  if (["declined", "rejected", "failed"].includes(normalized)) {
    return "destructive";
  }
  return "outline";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return value;
  }
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount / 100);
}

function Detail({ label, value }) {
  return (
    <p className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">
        {value ?? <em className="text-muted-foreground/70">Not available</em>}
      </span>
    </p>
  );
}

function InstallationTimeline({ timeline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation timeline</CardTitle>
        <CardDescription>A quick look at what’s happened and what’s next.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4 text-sm text-muted-foreground">
          {timeline.map((step) => (
            <li key={step.id} className="flex items-start gap-3">
              <div
                className={`mt-1 size-2 rounded-full ${
                  step.complete ? "bg-secondary" : "bg-border"
                }`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4 text-foreground">
                  <span className="font-medium">{step.title}</span>
                  {step.when ? (
                    <span className="text-xs text-muted-foreground">{formatDate(step.when)}</span>
                  ) : null}
                </div>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function PhotoSection({ photos, photoTab, setPhotoTab }) {
  const uploaded = photos.items ?? [];
  const samples = photos.samples ?? [];
  const missing = photos.missingCount ?? 0;
  const required = photos.required ?? 6;
  const tabs = [
    { id: "uploaded", label: `Uploaded (${uploaded.length})` },
    { id: "missing", label: `Missing (${missing})` },
    { id: "samples", label: "Example shots" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Site photos</CardTitle>
          <CardDescription>
            Uploading photos helps the install team prepare the right equipment.
          </CardDescription>
        </div>
        <div className="flex gap-2 rounded-md border border-border bg-muted/40 p-1 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPhotoTab(tab.id)}
              className={`rounded px-3 py-1 transition ${
                photoTab === tab.id ? "bg-background text-foreground shadow" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {photoTab === "uploaded" ? (
          uploaded.length ? (
            <ul className="grid gap-4 md:grid-cols-3">
              {uploaded.map((photo) => (
                <li key={photo.url} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    <img
                      src={photo.url}
                      alt={photo.label ?? "Uploaded photo"}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{photo.label ?? "Uploaded photo"}</div>
                    {photo.notes ? <p>{photo.notes}</p> : null}
                    <p>{photo.size ?? "JPEG"}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPhotoState />
          )
        ) : null}

        {photoTab === "missing" ? (
          <div className="space-y-4">
            <p>
              We still need {missing} photo{missing === 1 ? "" : "s"} to finalise your estimate. You can
              drag and drop them below or choose the “Skip for now” option.
            </p>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="font-medium text-foreground">Drop files here</p>
                <p className="text-sm text-muted-foreground">JPG or PNG up to 10MB each.</p>
                <Button className="mt-4" variant="secondary">
                  Select files
                </Button>
              </div>
              <div className="flex-1 rounded-lg border border-border bg-background p-6">
                <p className="font-medium text-foreground">Can’t share photos?</p>
                <p className="text-sm text-muted-foreground">
                  That’s okay—you can skip this step and we’ll call to confirm details.
                </p>
                <Button variant="outline" className="mt-4">
                  Skip photos for now
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {photoTab === "samples" ? (
          <div className="space-y-4">
            <p>Here’s what our install team typically needs:</p>
            <ul className="grid gap-4 md:grid-cols-3">
              {samples.map((sample) => (
                <li key={sample.id} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    <img src={sample.url} alt={sample.title} className="aspect-video w-full object-cover" />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{sample.title}</div>
                    <p>{sample.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EmptyPhotoState() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We haven’t received any photos yet. Upload a few shots of the main areas our technicians will work
        in so we can prepare the correct gear.
      </p>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="font-medium text-foreground">Drop files here</p>
          <p className="text-sm text-muted-foreground">JPG or PNG up to 10MB each.</p>
          <Button className="mt-4" variant="secondary">
            Select files
          </Button>
        </div>
        <div className="flex-1 rounded-lg border border-border bg-background p-6">
          <p className="font-medium text-foreground">Can’t share photos?</p>
          <p className="text-sm text-muted-foreground">
            Choose “Skip for now” and we’ll call to double-check anything we need before installation.
          </p>
          <Button variant="outline" className="mt-4">
            Skip photos for now
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentSection({ documents }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Your proposal, contract, and invoices live here.</CardDescription>
        </div>
        <Button variant="outline" size="sm" disabled>
          Upload document
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {documents.length ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
            >
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.subtitle ?? `${doc.type.toUpperCase()} • ${formatDate(doc.updatedAt)}`}
                </p>
              </div>
              <Badge variant={doc.signed ? "secondary" : "outline"}>
                {doc.signed ? "Signed" : "Pending"}
              </Badge>
            </div>
          ))
        ) : (
          <p className="col-span-full text-sm text-muted-foreground">
            You’ll see your proposal, contract, and invoices here once they’re ready.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentSection({ payments }) {
  const outstanding = payments.outstanding ?? 0;
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Track outstanding balance and past receipts.</CardDescription>
        </div>
        <Button disabled variant={outstanding > 0 ? "default" : "outline"}>
          {outstanding > 0 ? "Pay now" : "Paid in full"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
          <span>Outstanding balance</span>
          <span className="text-xl font-semibold text-foreground">
            {formatCurrency(payments.outstanding)}
          </span>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Payment history</h3>
          {payments.history.length ? (
            <ul className="space-y-3">
              {payments.history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(entry.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No payments recorded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskSection({ tasks, taskState, setTaskState }) {
  const toggleTask = (id) => {
    setTaskState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>Tick items off as you go. We’ll remind you about anything pending.</CardDescription>
        </div>
        <Badge variant="outline">{tasks.length} items</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {tasks.length ? (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className={`flex w-full items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:border-secondary ${
                taskState[task.id] ? "bg-secondary/20 text-foreground" : ""
              }`}
            >
              <span
                className={`mt-1 inline-flex size-4 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                  taskState[task.id] ? "border-secondary bg-secondary text-secondary-foreground" : ""
                }`}
              >
                {taskState[task.id] ? "✓" : ""}
              </span>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-foreground">{task.title}</p>
                <p>{task.description}</p>
              </div>
            </button>
          ))
        ) : (
          <p>Nothing outstanding right now.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SupportSection({ support }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>We’re here to help</CardTitle>
          <CardDescription>
            Reach out anytime—your support specialist is ready to answer questions.
          </CardDescription>
        </div>
        <Badge variant="outline">{support.specialist.role}</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned specialist</p>
          <p className="text-lg font-semibold text-foreground">{support.specialist.name}</p>
          <p className="text-muted-foreground">{support.specialist.bio}</p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
            <span>Phone: {support.specialist.phone}</span>
            <span>Email: {support.specialist.email}</span>
          </div>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <Button variant="outline" className="w-full justify-start gap-2" disabled>
            Request a call
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" disabled>
            Start chat
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-left" disabled>
            View FAQs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account preferences</CardTitle>
        <CardDescription>Manage how we stay in touch with you.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Security</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Button variant="outline" size="sm" disabled>
              Reset password
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Two-factor (coming soon)
            </Button>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Notifications</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="size-4 rounded border-border" />
              Email updates
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="size-4 rounded border-border" />
              SMS reminders
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" readOnly className="size-4 rounded border-border" />
              Push notifications
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityLog({ entries }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity log</CardTitle>
        <CardDescription>Everything that’s happened so far.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {entries.length ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
            >
              <div>
                <p className="font-medium text-foreground">{entry.title}</p>
                <p>{entry.description}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(entry.when)}</span>
            </div>
          ))
        ) : (
          <p>No activity recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function FAQSection() {
  return (
    <Card className="bg-muted/30 text-sm text-muted-foreground">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Need a hand?</CardTitle>
        <CardDescription>
          These are the questions customers ask most often. We’ll add more over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <details className="rounded border border-border bg-background p-3">
          <summary className="cursor-pointer text-foreground">How do I reschedule?</summary>
          <p className="mt-2">
            Click “Request a call” and let us know your preferred date—we’ll get back to you within the
            hour.
          </p>
        </details>
        <details className="rounded border border-border bg-background p-3">
          <summary className="cursor-pointer text-foreground">What photos do you need?</summary>
          <p className="mt-2">
            At minimum we need wide shots of the ceiling, any existing detectors, and the meter box.
          </p>
        </details>
      </CardContent>
    </Card>
  );
}

function mockPortalStatus(estimateId, locationId) {
  return {
    estimateId,
    locationId,
    nextStep: "Our team will confirm shortly.",
    quote: {
      status: "pending",
      statusLabel: "Awaiting approval",
      number: estimateId,
      acceptedAt: null,
    },
    account: {
      status: "pending",
      statusLabel: "Invite pending",
      lastInviteAt: null,
      expiresAt: null,
      portalUrl: null,
      resetUrl: null,
    },
    installation: {
      status: "pending",
      statusLabel: "Not scheduled",
      message: "We’ll confirm your installation window once photos are reviewed.",
      canSchedule: false,
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      timeline: mockTimelineSteps(),
    },
    photos: {
      items: [],
      missingCount: 6,
      required: 6,
      samples: mockSamplePhotos(),
    },
    payments: mockPaymentHistory(),
    documents: mockDocumentList(),
    tasks: mockTaskList(),
    support: mockSupportInfo(),
    activity: mockActivityLog(),
  };
}

function mockTimelineSteps() {
  return [
    {
      id: "request",
      title: "Quote requested",
      description: "Thanks for reaching out—your request is in our system.",
      when: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      complete: true,
    },
    {
      id: "photos",
      title: "Photos received",
      description: "We’re reviewing your site photos to finalise the proposal.",
      when: null,
      complete: false,
    },
    {
      id: "schedule",
      title: "Book installation",
      description: "We’ll send a scheduling link as soon as your proposal is accepted.",
      when: null,
      complete: false,
    },
  ];
}

function mockSamplePhotos() {
  return [
    {
      id: "ceiling",
      title: "Ceiling overview",
      description: "A wide shot of the area where you’d like the detector installed.",
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "switchboard",
      title: "Switchboard",
      description: "Include the door open so we can see the interior layout.",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "existing",
      title: "Existing detector",
      description: "If you already have a system installed, show us what’s there.",
      url: "https://images.unsplash.com/photo-1523419409543-0c1df022bddb?auto=format&fit=crop&w=800&q=60",
    },
  ];
}

function mockPaymentHistory() {
  return {
    outstanding: 129900,
    history: [
      {
        id: "deposit",
        label: "Deposit received",
        amount: 50000,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: "invoice",
        label: "Invoice issued",
        amount: 129900,
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  };
}

function mockDocumentList() {
  return [
    {
      id: "proposal",
      title: "Installation proposal",
      type: "proposal",
      signed: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: "contract",
      title: "Customer agreement",
      type: "contract",
      signed: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
  ];
}

function mockTaskList() {
  return [
    {
      id: "confirm-date",
      title: "Confirm installation date",
      description: "Choose a preferred day so we can lock in the technician.",
    },
    {
      id: "upload-meter",
      title: "Upload meter photo",
      description: "A clear shot helps us confirm compatibility before arrival.",
    },
    {
      id: "access",
      title: "Access instructions",
      description: "Let us know if there’s a gate code or special entry details.",
    },
  ];
}

function mockSupportInfo() {
  return {
    specialist: {
      name: "Jordan Reeves",
      role: "Customer success",
      bio: "Your point of contact for installation updates and questions.",
      phone: "1300 000 111",
      email: "support@cheapalarms.com.au",
    },
  };
}

function mockActivityLog() {
  return [
    {
      id: "invite",
      title: "Portal invite sent",
      description: "An invite email was delivered to admin@cheapalarms.com.au",
      when: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: "estimate",
      title: "Estimate reviewed",
      description: "Our team is preparing the detailed estimate for your site.",
      when: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "photos",
      title: "Waiting on site photos",
      description: "Send through the requested photos or tap Skip to continue without them.",
      when: new Date().toISOString(),
    },
  ];
}

