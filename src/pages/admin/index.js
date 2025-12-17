import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { AlertsStrip } from "@/components/admin/ui/AlertsStrip";
import { CardStat } from "@/components/admin/ui/CardStat";
import { ActivityList } from "@/components/admin/ui/ActivityList";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { getDashboardData, getDashboardErrorState } from "@/lib/admin/services/dashboard-data";
import { isAuthError, isPermissionError, getPermissionErrorMessage } from "@/lib/admin/utils/error-handler";

export default function AdminOverview({ stats, alerts, activity, error }) {
  return (
    <>
      <Head>
        <title>Superadmin • Overview</title>
      </Head>
      <AdminLayout title="Overview">
        {error && (
          <div className="mb-4 rounded-md border border-error/30 bg-error-bg p-4 text-sm text-error">
            <p className="font-semibold">Error loading dashboard data</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
        {alerts && alerts.length > 0 && <AlertsStrip items={alerts} />}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats?.map((s) => (
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
          {activity && activity.length > 0 ? (
            <ActivityList items={activity} />
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Recent activity</p>
              <p className="mt-2 text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
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
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin"),
        permanent: false,
      },
    };
  }

  try {
    const dashboardData = await getDashboardData(req);
    return {
      props: dashboardData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle authentication errors - redirect to login
    if (isAuthError(message)) {
      return {
        redirect: {
          destination: getLoginRedirect("/admin"),
          permanent: false,
        },
      };
    }

    // Handle permission errors (403) - show user-friendly message
    if (isPermissionError(message)) {
      return {
        props: getDashboardErrorState(
          getPermissionErrorMessage("the admin dashboard", "ca_view_estimates capability")
        ),
      };
    }

    return {
      props: getDashboardErrorState(message),
    };
  }
}
