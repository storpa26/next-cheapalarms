import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { useXeroStatus, useXeroAuthorize, useXeroDisconnect } from "@/lib/react-query/hooks/admin";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export default function AdminIntegrations() {
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  // Xero integration hooks
  const { data: xeroStatus, isLoading: xeroStatusLoading, refetch: refetchXeroStatus } = useXeroStatus();
  const { refetch: getXeroAuthUrl } = useXeroAuthorize();
  const disconnectXero = useXeroDisconnect();

  const isXeroConnected = xeroStatus?.ok && xeroStatus?.connected;

  const testConnection = useCallback(async () => {
    try {
      setTesting(true);
      setResult(null);
      // Mock result
      await new Promise((r) => setTimeout(r, 600));
      setResult({ ok: true, message: "GHL connected" });
    } finally {
      setTesting(false);
    }
  }, []);

  const handleConnectXero = useCallback(async () => {
    try {
      const result = await getXeroAuthUrl();
      if (result?.data?.ok && result?.data?.authUrl) {
        // Redirect to Xero authorization page
        window.location.href = result.data.authUrl;
      } else {
        throw new Error(result?.data?.err || result?.data?.error || 'Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Failed to get Xero auth URL:', error);
      setResult({ ok: false, message: error.message || "Failed to connect to Xero" });
    }
  }, [getXeroAuthUrl]);

  const handleDisconnectXero = useCallback(async () => {
    if (!confirm('Are you sure you want to disconnect Xero? This will require re-authorization to sync invoices.')) {
      return;
    }
    try {
      await disconnectXero.mutateAsync();
      setResult({ ok: true, message: "Xero disconnected successfully" });
    } catch (error) {
      setResult({ ok: false, message: error.message || "Failed to disconnect Xero" });
    }
  }, [disconnectXero]);

  return (
    <>
      <Head>
        <title>Superadmin • Integrations</title>
      </Head>
      <AdminLayout title="Integrations">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>GoHighLevel</CardTitle>
              <CardDescription>Credentials and connection test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-muted-foreground">API key</label>
                <Input
                  className="mt-1 w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_live_xxx"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">Location ID</label>
                <Input
                  className="mt-1 w-full"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  placeholder="LOC_XXXX"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Save</Button>
                <Button variant="ghost" size="sm" onClick={testConnection} disabled={testing}>
                  {testing ? "Testing…" : "Test connection"}
                </Button>
              </div>
              {result ? (
                <p className={`text-xs ${result.ok ? "text-success" : "text-error"}`}>{result.message}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Xero</CardTitle>
              <CardDescription>Invoice management and accounting integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {xeroStatusLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {isXeroConnected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Not Connected</span>
                      </>
                    )}
                  </div>
                  
                  {isXeroConnected && xeroStatus?.tenantId && (
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">Tenant ID</p>
                      <p className="text-xs font-mono text-foreground mt-1">{xeroStatus.tenantId}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isXeroConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectXero}
                        disabled={disconnectXero.isPending}
                      >
                        {disconnectXero.isPending ? "Disconnecting…" : "Disconnect"}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleConnectXero}
                        disabled={getXeroAuthUrl.isFetching || getXeroAuthUrl.isLoading}
                      >
                        {getXeroAuthUrl.isFetching || getXeroAuthUrl.isLoading ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Connecting…
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Connect Xero
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchXeroStatus()}
                      disabled={xeroStatusLoading}
                    >
                      Refresh
                    </Button>
                  </div>

                  {result && (result.message.includes("Xero") || result.message.includes("xero")) ? (
                    <p className={`text-xs ${result.ok ? "text-success" : "text-error"}`}>{result.message}</p>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const authCheck = await requireAdmin(ctx, { notFound: true });
  if (authCheck.notFound || authCheck.redirect) {
    return authCheck;
  }
  return { props: { ...(authCheck.props || {}) } };
}

