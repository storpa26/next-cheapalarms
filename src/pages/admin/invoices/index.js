import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminInvoices } from "@/lib/react-query/hooks/admin";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export default function InvoicesListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useAdminInvoices({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  });

  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleRowClick = (invoiceId) => {
    router.push(`/admin/invoices/${invoiceId}`);
  };

  return (
    <>
      <Head>
        <title>Invoices • Admin</title>
      </Head>
      <AdminLayout title="Invoices">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 rounded-xl border border-border/60 bg-card p-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by number, name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partiallyPaid">Partially Paid</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <p className="font-semibold">Error loading invoices</p>
              <p className="mt-1">{error.message}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
                <table className="w-full">
                  <thead className="border-b border-border/60 bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Amount Due</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Estimate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="cursor-pointer transition hover:bg-muted/40"
                        onClick={() => handleRowClick(invoice.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {invoice.invoiceNumber || invoice.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div>
                            <div className="font-medium">{invoice.contactName || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{invoice.contactEmail || ""}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                          {invoice.currency || "AUD"} {invoice.total?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                          {invoice.currency || "AUD"} {invoice.amountDue?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              invoice.status === "paid" ? "success" :
                              invoice.status === "sent" ? "info" :
                              invoice.status === "partiallyPaid" ? "warning" :
                              invoice.status === "voided" ? "destructive" :
                              "muted"
                            }
                          >
                            {invoice.status || "draft"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {invoice.linkedEstimateId ? (
                            <Link
                              href={`/admin/estimates/${invoice.linkedEstimateId}`}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-md border border-border/60 bg-background px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-md border border-border/60 bg-background px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/invoices"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

