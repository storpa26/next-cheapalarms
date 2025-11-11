import Head from "next/head";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEstimates } from "@/lib/wp";

export default function DashboardPage({ estimates, error }) {
  const items = estimates?.items ?? [];
  const summary = buildSummary(items);

  return (
    <>
      <Head>
        <title>CheapAlarms Dashboard</title>
      </Head>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/60 bg-card/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Backoffice
              </p>
              <h1 className="text-2xl font-semibold">Estimate dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Headless preview
              </span>
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
          {error ? (
            <Card className="border border-primary/40 bg-primary/5 text-primary">
              <CardHeader>
                <CardTitle>Could not load estimates</CardTitle>
                <CardDescription className="text-primary/80">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {summary.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader>
                      <CardDescription>{stat.label}</CardDescription>
                      <CardTitle className="text-3xl font-semibold">
                        {stat.value}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Recent estimates</CardTitle>
                    <CardDescription>
                      Showing the latest {items.length || 0} records available
                      to this user.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estimate</TableHead>
                          <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Portal</TableHead>
                          <TableHead className="text-right">
                            Created
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((estimate) => (
                          <TableRow key={estimate.id ?? estimate.estimateNumber}>
                            <TableCell className="font-medium">
                              {estimate.estimateNumber ?? estimate.id ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {estimate.email ?? "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={estimate.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {estimate.inviteToken ? (
                                <Link
                                  href={`/portal?estimateId=${encodeURIComponent(
                                    estimate.id ?? ""
                                  )}&locationId=${encodeURIComponent(
                                    estimates.locationId ?? ""
                                  )}&inviteToken=${encodeURIComponent(
                                    estimate.inviteToken
                                  )}`}
                                  className="text-primary underline hover:text-primary/80"
                                >
                                  Copy link
                                </Link>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatDate(estimate.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>
                        Powered by the CheapAlarms WordPress REST API.
                      </TableCaption>
                    </Table>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                      No estimates yet. Try again after creating one in GoHighLevel.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const estimates = await getEstimates(
      { limit: 50 },
      {
        headers: cookieHeader(req),
      }
    );
    return { props: { estimates } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (/401/.test(message) || /unauthor/i.test(message)) {
      return {
        redirect: {
          destination: `/login?from=${encodeURIComponent("/dashboard")}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        estimates: null,
        error: message,
      },
    };
  }
}

function cookieHeader(req) {
  const cookie = req?.headers?.cookie;
  return cookie ? { Cookie: cookie } : {};
}

function buildSummary(items) {
  if (!items.length) {
    return [
      { label: "Total estimates", value: 0 },
      { label: "Accepted", value: 0 },
      { label: "Awaiting action", value: 0 },
    ];
  }

  const lower = items.map((item) => (item.status ?? "").toLowerCase());
  const accepted = lower.filter((status) =>
    ["accepted", "approved"].includes(status)
  ).length;
  const awaiting = lower.filter((status) =>
    ["sent", "pending", "draft", ""].includes(status)
  ).length;

  return [
    { label: "Total estimates", value: items.length },
    { label: "Accepted", value: accepted },
    { label: "Awaiting action", value: awaiting },
  ];
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

function StatusBadge({ status }) {
  const label = status ?? "Unknown";
  const normalized = label.toLowerCase();

  let variant = "outline";
  if (["accepted", "approved"].includes(normalized)) {
    variant = "secondary";
  } else if (["declined", "rejected", "void"].includes(normalized)) {
    variant = "destructive";
  }

  return <Badge variant={variant}>{label || "Unknown"}</Badge>;
}

