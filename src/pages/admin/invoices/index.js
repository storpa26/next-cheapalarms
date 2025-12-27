import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Settings, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminInvoices } from "@/lib/react-query/hooks/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceDetailModal } from "@/components/admin/InvoiceDetailModal";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Avatar } from "@/components/admin/Avatar";
import { SearchBar } from "@/components/admin/SearchBar";
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENCY } from "@/lib/admin/constants";
import { toast } from "sonner";

export default function InvoicesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");
  const pageSize = DEFAULT_PAGE_SIZE;

  // Get invoiceId from URL query for deep linking
  const invoiceIdFromQuery = router.query.invoiceId;
  const selectedInvoiceId = invoiceIdFromQuery || null;

  // Map tab to status filter
  const statusFilter = activeTab === "all" ? "" : activeTab;

  const { data, isLoading, error, refetch } = useAdminInvoices({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    refetch();
  };

  // Handle Xero OAuth callback messages
  useEffect(() => {
    const { xero_connected, xero_error, tenant_id } = router.query;
    
    if (xero_connected === 'true') {
      toast.success('Xero connected successfully!');
      // Clean up URL
      const { xero_connected: _, tenant_id: __, ...restQuery } = router.query;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
    }
    
    if (xero_error) {
      toast.error(`Xero connection failed: ${decodeURIComponent(xero_error)}`);
      // Clean up URL
      const { xero_error: _, ...restQuery } = router.query;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  const invoices = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const sent = invoices.filter(i => i.ghlStatus === "sent");
    const paid = invoices.filter(i => i.ghlStatus === "paid");
    const partiallyPaid = invoices.filter(i => i.ghlStatus === "partiallyPaid");
    const overdue = invoices.filter(i => {
      if (!i.dueDate) return false;
      return new Date(i.dueDate) < new Date() && i.ghlStatus !== "paid";
    });

    return {
      sent: {
        count: sent.length,
        total: sent.reduce((sum, i) => sum + (i.total || 0), 0),
      },
      paid: {
        count: paid.length,
        total: paid.reduce((sum, i) => sum + (i.total || 0), 0),
      },
      partiallyPaid: {
        count: partiallyPaid.length,
        total: partiallyPaid.reduce((sum, i) => sum + (i.amountDue || 0), 0),
      },
      overdue: {
        count: overdue.length,
        total: overdue.reduce((sum, i) => sum + (i.amountDue || 0), 0),
      },
    };
  }, [invoices]);

  const handleRowClick = (invoiceId) => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, invoiceId },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleCloseModal = () => {
    const { invoiceId, ...restQuery } = router.query;
    router.replace(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const statusTabs = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "partiallyPaid", label: "Partially Paid" },
  ];

  const getStatusBadgeClass = (status) => {
    const classes = {
      draft: "bg-muted text-muted-foreground border-border",
      sent: "bg-info-bg text-info border-info/30",
      paid: "bg-success-bg text-success border-success/30",
      partiallyPaid: "bg-warning-bg text-warning border-warning/30",
      voided: "bg-error-bg text-error border-error/30",
      accepted: "bg-success-bg text-success border-success/30",
      rejected: "bg-error-bg text-error border-error/30",
    };
    return classes[status] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <>
      <Head>
        <title>Invoices • Admin</title>
      </Head>
      <AdminLayout title="Invoices">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and manage all invoices generated for your business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="default">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label={`${summaryMetrics.sent.count} in sent`}
              value={summaryMetrics.sent.total}
              currency={DEFAULT_CURRENCY}
              variant="sent"
            />
            <SummaryCard
              label={`${summaryMetrics.paid.count} in paid`}
              value={summaryMetrics.paid.total}
              currency={DEFAULT_CURRENCY}
              variant="accepted"
            />
            <SummaryCard
              label={`${summaryMetrics.partiallyPaid.count} partially paid`}
              value={summaryMetrics.partiallyPaid.total}
              currency={DEFAULT_CURRENCY}
              variant="default"
            />
            <SummaryCard
              label={`${summaryMetrics.overdue.count} overdue`}
              value={summaryMetrics.overdue.total}
              currency={DEFAULT_CURRENCY}
              variant="declined"
            />
          </div>

          {/* Status Tabs */}
          <StatusTabs tabs={statusTabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Search Bar */}
          <SearchBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            startDate={startDate}
            onStartDateChange={(value) => {
              setStartDate(value);
              setPage(1);
            }}
            endDate={endDate}
            onEndDateChange={(value) => {
              setEndDate(value);
              setPage(1);
            }}
            placeholder="Search by number, name, email..."
          />

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-error/30 bg-error-bg p-4 text-sm text-error">
              <p className="font-semibold">Error loading invoices</p>
              <p className="mt-1">
                {error.message?.includes('SSL') || error.message?.includes('SSL_ERROR') || error.message?.includes('cURL error 35')
                  ? "Unable to connect to GoHighLevel API due to SSL certificate issue. This is usually caused by outdated SSL certificates on your server, firewall blocking the connection, or network connectivity issues. Please contact your hosting provider for assistance."
                  : error.message || "An unexpected error occurred"}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-error">Technical details</summary>
                  <pre className="mt-2 overflow-auto rounded bg-error-bg/50 p-2">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => handleRowClick(invoice.id)}
                    className="bg-surface rounded-lg border border-border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          Invoice #{invoice.invoiceNumber || invoice.id}
                        </h3>
                        {invoice.linkedEstimateId && (
                          <p className="text-xs text-primary">
                            Estimate: {invoice.linkedEstimateId}
                          </p>
                        )}
                      </div>
                      <span
                        className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${getStatusBadgeClass(invoice.portalStatus || invoice.ghlStatus || "sent")}
                        `}
                      >
                        {invoice.portalStatus || invoice.ghlStatus || "sent"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar
                        name={invoice.contactName}
                        email={invoice.contactEmail}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {invoice.contactName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {invoice.contactEmail || ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-semibold text-foreground">
                          {invoice.total > 0
                            ? `${invoice.currency || DEFAULT_CURRENCY} ${invoice.total.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Due</p>
                        <p className="text-sm font-semibold text-success">
                          {invoice.amountDue !== undefined
                            ? `${invoice.currency || DEFAULT_CURRENCY} ${invoice.amountDue.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm text-foreground">
                          {invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Updated</p>
                        <p className="text-sm text-foreground">
                          {invoice.updatedAt
                            ? new Date(invoice.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Total
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Amount Due
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Estimate
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Created
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="cursor-pointer transition-colors hover:bg-primary/5"
                          onClick={() => handleRowClick(invoice.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="link"
                              className="font-medium text-sm p-0 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(invoice.id);
                              }}
                            >
                              {invoice.invoiceNumber || invoice.id}
                            </Button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={invoice.contactName}
                                email={invoice.contactEmail}
                                size="md"
                              />
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {invoice.contactName || "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {invoice.contactEmail || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                            {invoice.currency || DEFAULT_CURRENCY} {invoice.total?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                            {invoice.currency || DEFAULT_CURRENCY} {invoice.amountDue?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${getStatusBadgeClass(invoice.portalStatus || invoice.ghlStatus || "sent")}
                              `}
                            >
                              {invoice.portalStatus || invoice.ghlStatus || "sent"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {invoice.linkedEstimateId ? (
                              <Link
                                href={`/admin/estimates/${invoice.linkedEstimateId}`}
                                className="text-primary hover:text-primary-hover hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {invoice.createdAt
                              ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add dropdown menu
                              }}
                              variant="ghost"
                              size="icon-sm"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-surface px-6 py-4 border-t border-border rounded-b-lg">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Invoice Detail Modal */}
        <InvoiceDetailModal
          isOpen={!!selectedInvoiceId}
          onClose={handleCloseModal}
          invoiceId={selectedInvoiceId || undefined}
          locationId={locationId || undefined}
        />
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
