import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { AlertsStrip } from "@/components/admin/ui/AlertsStrip";
import { CardStat } from "@/components/admin/ui/CardStat";
import { ActivityList } from "@/components/admin/ui/ActivityList";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";

// This component should never render - getServerSideProps redirects to /admin/estimates
export default function AdminOverview() {
  const alerts = [
    { title: "3 invites expiring in 48 hours", description: "Consider resending." },
    { title: "API health degraded", description: "2 errors in the last hour." },
  ];
  const stats = [
    { title: "Estimates pending", value: 12, hint: "5 awaiting photos" },
    { title: "Installs this week", value: 7, hint: "2 unassigned" },
    { title: "Payments due", value: "$1,240", hint: "4 invoices outstanding" },
    { title: "Products", value: "5/12/3", hint: "base/addons/packages" },
  ];
  const activity = [
    { title: "Invite resent", description: "to john@example.com", when: "2m ago" },
    { title: "Package updated", description: "Residential Wireless Starter", when: "1h ago" },
    { title: "New addon", description: "Outdoor MotionCam added", when: "3h ago" },
  ];

  return (
    <>
      <Head>
        <title>Superadmin • Overview</title>
      </Head>
      <AdminLayout title="Overview">
        <AlertsStrip items={alerts} />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <CardStat key={s.title} title={s.title} value={s.value} hint={s.hint} />
          ))}
        </section>
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Quick actions</p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <ActionLink label="Add product" href="/admin/products" />
              <ActionLink label="Create package" href="/admin/products" />
              <ActionLink label="Resend invite" href="/admin/invites" />
              <ActionLink label="Sync GHL" href="/admin/integrations" />
            </div>
          </div>
          <ActivityList items={activity} />
        </section>
      </AdminLayout>
    </>
  );
}

function ActionLink({ label, href }) {
  return (
    <a className="rounded-md border border-border/60 bg-background px-3 py-2 text-foreground transition hover:bg-muted/40" href={href}>
      {label}
    </a>
  );
}

export async function getServerSideProps({ req }) {
  // Check authentication first
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}
