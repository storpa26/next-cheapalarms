import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Settings, Plus, MoreVertical } from "lucide-react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminEstimates } from "@/lib/react-query/hooks/admin";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { EstimateDetailModal } from "@/components/admin/EstimateDetailModal";
import { SummaryCard } from "@/components/admin/SummaryCard";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Avatar } from "@/components/admin/Avatar";
import { SearchBar } from "@/components/admin/SearchBar";

export default function EstimatesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");
  const pageSize = 20;

  // Get estimateId from URL query for deep linking
  const estimateIdFromQuery = router.query.estimateId;
  const [selectedEstimateId, setSelectedEstimateId] = useState(
    estimateIdFromQuery || null
  );

  // Sync with URL query param
  useEffect(() => {
    if (estimateIdFromQuery && estimateIdFromQuery !== selectedEstimateId) {
      setSelectedEstimateId(estimateIdFromQuery);
    } else if (!estimateIdFromQuery && selectedEstimateId) {
      setSelectedEstimateId(null);
    }
  }, [estimateIdFromQuery]);

  // Map tab to portal status filter
  const portalStatusFilter = activeTab === "all" ? "" : activeTab;

  const { data, isLoading, error, refetch } = useAdminEstimates({
    search: search || undefined,
    portalStatus: portalStatusFilter || undefined,
    page,
    pageSize,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    refetch();
  };

  const estimates = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Use backend summary totals (calculated across ALL estimates, not just current page)
  const summaryMetrics = useMemo(() => {
    const backendSummary = data?.summary;
    if (backendSummary) {
      return {
        sent: {
          count: backendSummary.sent?.count || 0,
          total: backendSummary.sent?.total || 0,
        },
        accepted: {
          count: backendSummary.accepted?.count || 0,
          total: backendSummary.accepted?.total || 0,
        },
        declined: {
          count: backendSummary.rejected?.count || 0,
          total: backendSummary.rejected?.total || 0,
        },
        invoiced: {
          count: backendSummary.invoiced?.count || 0,
          total: backendSummary.invoiced?.total || 0,
        },
      };
    }
    
    // Fallback: calculate from current page if backend summary not available
    const sent = estimates.filter(e => e.portalStatus === "sent" || e.ghlStatus === "sent");
    const accepted = estimates.filter(e => e.portalStatus === "accepted");
    const declined = estimates.filter(e => e.portalStatus === "rejected");
    const invoiced = estimates.filter(e => e.linkedInvoiceId);

    return {
      sent: {
        count: sent.length,
        total: sent.reduce((sum, e) => sum + (e.total || 0), 0),
      },
      accepted: {
        count: accepted.length,
        total: accepted.reduce((sum, e) => sum + (e.total || 0), 0),
      },
      declined: {
        count: declined.length,
        total: declined.reduce((sum, e) => sum + (e.total || 0), 0),
      },
      invoiced: {
        count: invoiced.length,
        total: invoiced.reduce((sum, e) => sum + (e.total || 0), 0),
      },
    };
  }, [data?.summary, estimates]);

  const handleRowClick = (estimateId) => {
    setSelectedEstimateId(estimateId);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, estimateId },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleCloseModal = () => {
    setSelectedEstimateId(null);
    const { estimateId, ...restQuery } = router.query;
    router.replace(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleInvoiceCreated = () => {
    handleRefresh();
  };

  const statusTabs = [
    { value: "all", label: "All" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  const getStatusBadgeClass = (status) => {
    const classes = {
      sent: "bg-amber-100 text-amber-700 border-amber-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return classes[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <>
      <Head>
        <title>Estimates • Admin</title>
      </Head>
      <AdminLayout title="Estimates">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage all estimates generated for your business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                New Estimate
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
              label={`${summaryMetrics.accepted.count} in accepted`}
              value={summaryMetrics.accepted.total}
              currency="AU$"
              variant="accepted"
            />
            <SummaryCard
              label={`${summaryMetrics.declined.count} in declined`}
              value={summaryMetrics.declined.total}
              currency="AU$"
              variant="declined"
            />
            <SummaryCard
              label={`${summaryMetrics.invoiced.count} in invoiced`}
              value={summaryMetrics.invoiced.total}
              currency="AU$"
              variant="invoiced"
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
            placeholder="Search by number, email..."
          />

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <p className="font-semibold">Error loading estimates</p>
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
          ) : estimates.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No estimates found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    onClick={() => handleRowClick(estimate.id)}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {estimate.title || "ESTIMATE"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          #{estimate.estimateNumber || estimate.id}
                        </p>
                      </div>
                      <span
                        className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${getStatusBadgeClass(estimate.portalStatus || "sent")}
                        `}
                      >
                        {estimate.portalStatus || "sent"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar
                        name={estimate.contactName}
                        email={estimate.contactEmail}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {estimate.contactName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {estimate.contactEmail || ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Value</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {estimate.total > 0
                            ? `${estimate.currency || "AU$"} ${estimate.total.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm text-gray-900">
                          {estimate.createdAt
                            ? new Date(estimate.createdAt).toLocaleDateString("en-US", {
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
                          Quote Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Estimate Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Created
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Value
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estimates.map((estimate) => (
                        <tr
                          key={estimate.id}
                          className="cursor-pointer transition-colors hover:bg-blue-50/30"
                          onClick={() => handleRowClick(estimate.id)}
                        >
                          <td className="px-6 py-4">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm text-left max-w-xs truncate block"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(estimate.id);
                              }}
                              title={estimate.title || "ESTIMATE"}
                            >
                              {estimate.title || "ESTIMATE"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {estimate.estimateNumber || estimate.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={estimate.contactName}
                                email={estimate.contactEmail}
                                size="md"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {estimate.contactName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {estimate.contactEmail || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {estimate.createdAt
                              ? new Date(estimate.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {estimate.total > 0
                              ? `${estimate.currency || "AU$"} ${estimate.total.toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${getStatusBadgeClass(estimate.portalStatus || "sent")}
                              `}
                            >
                              {estimate.portalStatus || "sent"}
                            </span>
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

        {/* Estimate Detail Modal */}
        <EstimateDetailModal
          isOpen={!!selectedEstimateId}
          onClose={handleCloseModal}
          estimateId={selectedEstimateId || undefined}
          locationId={locationId || undefined}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/estimates"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}
