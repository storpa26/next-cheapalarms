import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Settings, Plus, MoreVertical } from "lucide-react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminInvoices } from "@/lib/react-query/hooks/admin";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceDetailModal } from "@/components/admin/InvoiceDetailModal";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Avatar } from "@/components/admin/Avatar";
import { SearchBar } from "@/components/admin/SearchBar";

export default function InvoicesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");
  const pageSize = 20;

  // Get invoiceId from URL query for deep linking
  const invoiceIdFromQuery = router.query.invoiceId;
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    invoiceIdFromQuery || null
  );

  // Sync with URL query param
  useEffect(() => {
    if (invoiceIdFromQuery && invoiceIdFromQuery !== selectedInvoiceId) {
      setSelectedInvoiceId(invoiceIdFromQuery);
    } else if (!invoiceIdFromQuery && selectedInvoiceId) {
      setSelectedInvoiceId(null);
    }
  }, [invoiceIdFromQuery]);

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

  const invoices = data?.items ?? [];
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
    setSelectedInvoiceId(invoiceId);
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
    setSelectedInvoiceId(null);
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
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      sent: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-green-100 text-green-700 border-green-200",
      partiallyPaid: "bg-amber-100 text-amber-700 border-amber-200",
      voided: "bg-red-100 text-red-700 border-red-200",
      sent: "bg-amber-100 text-amber-700 border-amber-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return classes[status] || "bg-gray-100 text-gray-700 border-gray-200";
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
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage all invoices generated for your business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                New Invoice
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label={`${summaryMetrics.sent.count} in sent`}
              value={summaryMetrics.sent.total}
              currency="AU$"
              variant="sent"
            />
            <SummaryCard
              label={`${summaryMetrics.paid.count} in paid`}
              value={summaryMetrics.paid.total}
              currency="AU$"
              variant="accepted"
            />
            <SummaryCard
              label={`${summaryMetrics.partiallyPaid.count} partially paid`}
              value={summaryMetrics.partiallyPaid.total}
              currency="AU$"
              variant="default"
            />
            <SummaryCard
              label={`${summaryMetrics.overdue.count} overdue`}
              value={summaryMetrics.overdue.total}
              currency="AU$"
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <p className="font-semibold">Error loading invoices</p>
              <p className="mt-1">
                {error.message?.includes('SSL') || error.message?.includes('SSL_ERROR') || error.message?.includes('cURL error 35')
                  ? "Unable to connect to GoHighLevel API due to SSL certificate issue. This is usually caused by outdated SSL certificates on your server, firewall blocking the connection, or network connectivity issues. Please contact your hosting provider for assistance."
                  : error.message || "An unexpected error occurred"}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-red-600 dark:text-red-400">Technical details</summary>
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 dark:bg-red-900/50">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No invoices found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => handleRowClick(invoice.id)}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          Invoice #{invoice.invoiceNumber || invoice.id}
                        </h3>
                        {invoice.linkedEstimateId && (
                          <p className="text-xs text-blue-600">
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {invoice.contactName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {invoice.contactEmail || ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {invoice.total > 0
                            ? `${invoice.currency || "AU$"} ${invoice.total.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount Due</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {invoice.amountDue !== undefined
                            ? `${invoice.currency || "AU$"} ${invoice.amountDue.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm text-gray-900">
                          {invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Updated</p>
                        <p className="text-sm text-gray-900">
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
              <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Total
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Amount Due
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Estimate
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Created
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="cursor-pointer transition-colors hover:bg-blue-50/30"
                          onClick={() => handleRowClick(invoice.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(invoice.id);
                              }}
                            >
                              {invoice.invoiceNumber || invoice.id}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={invoice.contactName}
                                email={invoice.contactEmail}
                                size="md"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {invoice.contactName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {invoice.contactEmail || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {invoice.currency || "AU$"} {invoice.total?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {invoice.currency || "AU$"} {invoice.amountDue?.toFixed(2) || "0.00"}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.linkedEstimateId ? (
                              <Link
                                href={`/admin/estimates/${invoice.linkedEstimateId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.createdAt
                              ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add dropdown menu
                              }}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
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
