import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

    setLoading(true);
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
      .finally(() => setLoading(false));
  }, [router, status]);

  return (
    <>
      <Head>
        <title>Customer Portal • CheapAlarms</title>
      </Head>
      <main className="relative min-h-screen bg-background text-foreground">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
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
              We pull live data from WordPress via the headless API bridge.
            </p>
          </header>

          {loading && (
            <p className="mb-6 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Loading latest portal status…
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
              <p className="font-semibold">We hit a snag.</p>
              <p className="mt-1 text-primary/80">{error}</p>
            </div>
          )}

          {status && (
            <section className="space-y-6">
              <Card title="Estimate">
                <Detail label="Estimate ID" value={status.estimateId} />
                <Detail label="Status" value={status.status ?? "pending"} />
                <Detail label="Next step" value={status.nextStep ?? "—"} />
              </Card>

              <Card title="Account access">
                <Detail
                  label="Invite sent"
                  value={status.invite?.sentAt ?? "—"}
                />
                <Detail
                  label="Portal URL"
                  value={
                    status.invite?.portalUrl ? (
                      <a
                        href={status.invite.portalUrl}
                        className="text-primary underline hover:text-primary/80"
                      >
                        Open portal
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </Card>

              {status.photos?.length ? (
                <Card title="Uploaded photos">
                  <ul className="grid grid-cols-2 gap-4">
                    {status.photos.map((photo) => (
                      <li key={photo.url}>
                        <img
                          src={photo.url}
                          alt={photo.label ?? "Uploaded photo"}
                          className="h-40 w-full rounded-lg object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : (
                <Card title="Uploaded photos">
                  <p className="text-muted-foreground">No photos uploaded yet.</p>
                </Card>
              )}
            </section>
          )}
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

function Card({ title, children }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {children}
      </div>
    </article>
  );
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

