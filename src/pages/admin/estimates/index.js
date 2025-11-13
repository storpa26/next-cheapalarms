import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminEstimates() {
  const [q, setQ] = useState("");
  const rows = mockEstimates().filter((r) => filter(r, q));
  return (
    <>
      <Head>
        <title>Superadmin • Estimates</title>
      </Head>
      <AdminLayout title="Estimates">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Estimates</CardTitle>
              <CardDescription>Mock data; wire to WordPress when ready.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search customer, number…"
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
                    <th className="px-3 py-2">Number</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-3 py-2">{r.number}</td>
                      <td className="px-3 py-2">{r.customer}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs ${badge(r.status)}`}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2">${r.total}</td>
                      <td className="px-3 py-2">{r.updated}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Open</Button>
                          <Button variant="outline" size="sm">Copy portal</Button>
                          <Button variant="ghost" size="sm">Resend invite</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={6}>
                        No estimates match your search.
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

function badge(s) {
  if (s === "Accepted") return "bg-green-100 text-green-700 border border-green-300";
  if (s === "Pending") return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  if (s === "Declined") return "bg-red-100 text-red-700 border border-red-300";
  return "bg-muted text-foreground border border-border/60";
}

function filter(r, q) {
  if (!q?.trim()) return true;
  const s = q.toLowerCase();
  return r.customer.toLowerCase().includes(s) || r.number.toLowerCase().includes(s);
}

function mockEstimates() {
  return [
    { id: "e1", number: "EST-1001", customer: "John Smith", status: "Pending", total: "899.00", updated: "Today 11:12" },
    { id: "e2", number: "EST-1002", customer: "Mary Jones", status: "Accepted", total: "1,299.00", updated: "Yesterday" },
    { id: "e3", number: "EST-1003", customer: "Acme Pty Ltd", status: "Declined", total: "2,150.00", updated: "2 days ago" },
  ];
}


