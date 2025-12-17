import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Settings, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENCY } from "@/lib/admin/constants";

export default function EstimatesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState(""); // NEW: Workflow status filter
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");
  const pageSize = DEFAULT_PAGE_SIZE;

  // Get estimateId from URL query for deep linking
  const estimateIdFromQuery = router.query.estimateId;
  const selectedEstimateId = estimateIdFromQuery || null;

  // Map tab to portal status filter
  const portalStatusFilter = activeTab === "all" ? "" : activeTab;

  const { data, isLoading, error, refetch } = useAdminEstimates({
    search: search || undefined,
    portalStatus: portalStatusFilter || undefined,
    workflowStatus: workflowStatusFilter || undefined, // NEW: Add workflow status filter
    page,
    pageSize,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    refetch();
  };

  const estimates = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

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
      sent: "bg-warning-bg text-warning border-warning/30",
      accepted: "bg-success-bg text-success border-success/30",
      rejected: "bg-error-bg text-error border-error/30",
    };
    return classes[status] || "bg-muted text-muted-foreground border-border";
  };

  const getWorkflowStatusBadgeClass = (status) => {
    const classes = {
      requested: "bg-muted text-muted-foreground border-border",
      reviewing: "bg-info-bg text-info border-info/30",
      accepted: "bg-success-bg text-success border-success/30",
      booked: "bg-secondary/10 text-secondary border-secondary/30",
      paid: "bg-warning-bg text-warning border-warning/30",
      completed: "bg-success-bg text-success border-success/30",
    };
    return classes[status] || "bg-muted text-muted-foreground border-border";
  };

  const getWorkflowStatusLabel = (status) => {
    const labels = {
      requested: "Requested",
      reviewing: "Reviewing",
      accepted: "Accepted",
      booked: "Booked",
      paid: "Paid",
      completed: "Completed",
    };
    return labels[status] || status;
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
              <h1 className="text-3xl font-bold text-foreground">Estimates</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and manage all estimates generated for your business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="default">
                <Plus className="h-4 w-4" />
                New Estimate
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
              label={`${summaryMetrics.accepted.count} in accepted`}
              value={summaryMetrics.accepted.total}
              currency={DEFAULT_CURRENCY}
              variant="accepted"
            />
            <SummaryCard
              label={`${summaryMetrics.declined.count} in declined`}
              value={summaryMetrics.declined.total}
              currency={DEFAULT_CURRENCY}
              variant="declined"
            />
            <SummaryCard
              label={`${summaryMetrics.invoiced.count} in invoiced`}
              value={summaryMetrics.invoiced.total}
              currency={DEFAULT_CURRENCY}
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
            workflowStatus={workflowStatusFilter}
            onWorkflowStatusChange={(value) => {
              setWorkflowStatusFilter(value);
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
            <div className="rounded-lg border border-error/30 bg-error-bg p-4 text-sm text-error">
              <p className="font-semibold">Error loading estimates</p>
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
          ) : estimates.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">No estimates found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    onClick={() => handleRowClick(estimate.id)}
                    className="bg-surface rounded-lg border border-border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {estimate.title || "ESTIMATE"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          #{estimate.estimateNumber || estimate.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${getStatusBadgeClass(estimate.portalStatus || "sent")}
                          `}
                        >
                          {estimate.portalStatus || "sent"}
                        </span>
                        {estimate.workflowStatus && (
                          <span
                            className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                              ${getWorkflowStatusBadgeClass(estimate.workflowStatus)}
                            `}
                          >
                            {getWorkflowStatusLabel(estimate.workflowStatus)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar
                        name={estimate.contactName}
                        email={estimate.contactEmail}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {estimate.contactName || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {estimate.contactEmail || ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-semibold text-foreground">
                          {estimate.total > 0
                            ? `${estimate.currency || DEFAULT_CURRENCY} ${estimate.total.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm text-foreground">
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
              <div className="hidden lg:block bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Quote Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Estimate Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Created
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Value
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Portal Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Workflow
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                      {estimates.map((estimate) => (
                        <tr
                          key={estimate.id}
                          className="cursor-pointer transition-colors hover:bg-primary/5"
                          onClick={() => handleRowClick(estimate.id)}
                        >
                          <td className="px-6 py-4">
                            <Button
                              variant="link"
                              className="font-medium text-sm text-left max-w-xs truncate block p-0 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(estimate.id);
                              }}
                              title={estimate.title || "ESTIMATE"}
                            >
                              {estimate.title || "ESTIMATE"}
                            </Button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
                                <div className="text-sm font-medium text-foreground">
                                  {estimate.contactName || "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {estimate.contactEmail || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {estimate.createdAt
                              ? new Date(estimate.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                            {estimate.total > 0
                              ? `${estimate.currency || DEFAULT_CURRENCY} ${estimate.total.toFixed(2)}`
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${getWorkflowStatusBadgeClass(estimate.workflowStatus || "requested")}
                              `}
                            >
                              {getWorkflowStatusLabel(estimate.workflowStatus || "requested")}
                            </span>
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
