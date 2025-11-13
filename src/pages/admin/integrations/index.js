import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminIntegrations() {
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  async function testConnection() {
    try {
      setTesting(true);
      setResult(null);
      // Mock result
      await new Promise((r) => setTimeout(r, 600));
      setResult({ ok: true, message: "GHL connected" });
    } finally {
      setTesting(false);
    }
  }

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
                <input
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_live_xxx"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">Location ID</label>
                <input
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
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
                <p className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}


