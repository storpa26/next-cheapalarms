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

export default function PortalPage({ initialStatus, initialError }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Head>
        <title>Customer Portal • CheapAlarms</title>
      </Head>
      <main className="relative min-h-screen bg-background text-foreground">
        <div className="absolute right-6 top-6 flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.4rem] text-muted-foreground">
              Customer Portal
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Your installation at a glance
            </h1>
            <p className="mt-2 text-muted-foreground">
              Live data from the CheapAlarms WordPress API.
            </p>
            {inviteToken ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Invite token provided: <code>{inviteToken}</code>
              </p>
            ) : null}
          </header>

          {loading && (
            <Card className="mb-6 border-dashed border-border bg-muted/30 text-muted-foreground">
              <CardHeader>
                <CardTitle>Refreshing</CardTitle>
                <CardDescription>Loading the latest portal status…</CardDescription>
              </CardHeader>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border border-primary/40 bg-primary/10 text-primary">
              <CardHeader>
                <CardTitle>We hit a snag</CardTitle>
                <CardDescription className="text-primary/80">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {view ? (
            <section className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Estimate</CardTitle>
                    <CardDescription>
                      Estimate {view.estimateId ?? "unknown"}
                    </CardDescription>
                  </div>
                  <Badge variant={badgeVariant(view.quote.status)}>
                    {view.quote.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <Detail label="Quote number" value={view.quote.number} />
                  <Detail label="Next step" value={view.nextStep} />
                  <Detail
                    label="Accepted on"
                    value={formatDate(view.quote.acceptedAt)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Portal account</CardTitle>
                    <CardDescription>
                      Manage customer access to the dashboard.
                    </CardDescription>
                  </div>
                  <Badge variant={badgeVariant(view.account.status)}>
                    {view.account.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <Detail
                    label="Invite last sent"
                    value={formatDate(view.account.lastInviteAt)}
                  />
                  <Detail
                    label="Invite expires"
                    value={formatDate(view.account.expiresAt)}
                  />
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

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Installation</CardTitle>
                    <CardDescription>
                      {view.installation.message ?? "Scheduling details"}
                    </CardDescription>
                  </div>
                  <Badge variant={badgeVariant(view.installation.status)}>
                    {view.installation.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <Detail
                    label="Can schedule"
                    value={view.installation.canSchedule ? "Yes" : "No"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Photos</CardTitle>
                    <CardDescription>
                      {view.photos.items.length
                        ? `${view.photos.items.length} uploaded`
                        : "No uploads yet"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {view.photos.missingCount > 0
                      ? `${view.photos.missingCount} missing`
                      : "Complete"}
                  </Badge>
                </CardHeader>
                <CardContent>
                      {view.photos.items.length ? (
                    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {view.photos.items.map((photo) => (
                        <li key={photo.url}>
                          <figure className="overflow-hidden rounded-lg border border-border">
                            <img
                              src={photo.url}
                              alt={photo.label ?? "Uploaded photo"}
                              className="h-32 w-full object-cover"
                            />
                            <figcaption className="px-2 py-1 text-xs text-muted-foreground">
                              {photo.label ?? "Uploaded photo"}
                            </figcaption>
                          </figure>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      We’ll show photos here once the customer uploads them.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

PortalPage.getInitialProps = async ({ query, req }) => {
  const estimateId = query.estimateId;
  if (!estimateId) {
    return { initialStatus: null, initialError: "estimateId is required." };
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
    return { initialStatus: status, initialError: null };
  } catch (error) {
    return {
      initialStatus: null,
      initialError: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

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
    },
    photos: {
      items: Array.isArray(photos.items) ? photos.items : [],
      missingCount:
        photos.missingCount ??
        Math.max(
          0,
          (photos.required ?? 0) - (Array.isArray(photos.items) ? photos.items.length : 0)
        ),
    },
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

