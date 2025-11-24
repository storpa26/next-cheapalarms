import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";

export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const rows = mockCustomers().filter((r) => filter(r, q));
  return (
    <>
      <Head>
        <title>Superadmin • Customers</title>
      </Head>
      <AdminLayout title="Customers">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Portal access and roles.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search name, email…"
                className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button variant="outline" size="sm">Refresh</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Portal</th>
                    <th className="px-3 py-2">Roles</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.portal}</td>
                      <td className="px-3 py-2">{r.roles.join(", ")}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reset link</Button>
                          <Button variant="ghost" size="sm">Grant ca_access_portal</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={5}>
                        No customers match your search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}

function filter(r, q) {
  if (!q?.trim()) return true;
  const s = q.toLowerCase();
  return r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s);
}

function mockCustomers() {
  return [
    { id: "c1", name: "John Smith", email: "john@example.com", portal: "Active", roles: ["customer"] },
    { id: "c2", name: "Mary Jones", email: "mary@example.com", portal: "Invited", roles: ["customer"] },
    { id: "c3", name: "Ops Admin", email: "ops@example.com", portal: "Active", roles: ["ca_admin"] },
  ];
}

export async function getServerSideProps({ req }) {
  // Check authentication first
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/customers"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

