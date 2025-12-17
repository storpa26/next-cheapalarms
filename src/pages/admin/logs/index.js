import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";

export default function AdminLogs() {
  const [tail, setTail] = useState(mockLogs());
  const refresh = useCallback(() => {
    setTail(mockLogs());
  }, []);
  return (
    <>
      <Head>
        <title>Superadmin • Logs</title>
      </Head>
      <AdminLayout title="Logs">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Error log tail</CardTitle>
                <CardDescription>Last 100 lines (mock).</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refresh}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto rounded-md border border-border/60 bg-background p-3 text-xs leading-relaxed text-muted-foreground">
                {tail}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Health</CardTitle>
              <CardDescription>API and integrations (mock).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                WordPress API: <span className="font-medium text-success">OK</span>
              </p>
              <p>
                GHL: <span className="font-medium text-success">OK</span>
              </p>
              <p>
                Rate limit: <span className="font-medium text-warning">Moderate</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}

function mockLogs() {
  return `[11:10:23] INFO  REST route registered: /ca/v1/products
[11:10:25] INFO  Invite sent to john@example.com
[11:12:01] WARN  Rate limited auth_token from 127.0.0.1
[11:12:44] ERROR Failed to fetch /uploads: network timeout`;
}

export async function getServerSideProps({ req }) {
  // Check authentication first
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/logs"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

