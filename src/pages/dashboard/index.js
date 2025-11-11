import Head from "next/head";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getEstimates } from "@/lib/wp";

export default function DashboardPage({ estimates, error }) {
  return (
    <>
      <Head>
        <title>CheapAlarms Dashboard</title>
      </Head>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/60 bg-card/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <h1 className="text-xl font-semibold">Estimate dashboard</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Headless preview
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-5xl px-6 py-10">
          {error ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
              <p className="font-semibold">Could not load estimates.</p>
              <p className="mt-1 text-primary/80">{error}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Estimate</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {estimates?.data?.length ? (
                    estimates.data.map((estimate) => (
                      <tr key={estimate.id} className="transition hover:bg-muted">
                        <td className="px-4 py-3 font-medium">
                          {estimate.name ?? estimate.id}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {estimate.contact?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {estimate.status ?? "unknown"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(estimate.total ?? 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No estimates yet. Try again after creating one in GHL.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const estimates = await getEstimates(
      { limit: 25 },
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

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(Number(value) / 100);
  } catch (error) {
    return `$${(Number(value) / 100).toFixed(2)}`;
  }
}

