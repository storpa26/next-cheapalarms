import Head from "next/head";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Settings, Plus, Download, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { 
  useAdminEstimates, 
  useAdminEstimatesTrash,
  useAdminEstimatesChart,
  useDeleteEstimate,
  useBulkDeleteEstimates
} from "../../../lib/react-query/hooks/admin";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import { Spinner } from "../../../components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { EstimateDetailModal } from "../../../components/admin/EstimateDetailModal";
import { SummaryCard } from "../../../components/admin/SummaryCard";
import { StatusTabs } from "../../../components/admin/StatusTabs";
import { Avatar } from "../../../components/admin/Avatar";
import { SearchBar } from "../../../components/admin/SearchBar";
import { DeleteDialog } from "../../../components/admin/DeleteDialog";
import { BulkDeleteDialog } from "../../../components/admin/BulkDeleteDialog";
import { EstimateActionsMenu } from "../../../components/admin/EstimateActionsMenu";
import { TrashView } from "../../../components/admin/TrashView";
import { FloatingActionBar } from "../../../components/admin/FloatingActionBar";
import { EstimatesChart } from "../../../components/admin/EstimatesChart";
import { TimeRangeSelector } from "../../../components/admin/TimeRangeSelector";
import { Checkbox } from "../../../components/ui/checkbox";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENCY } from "../../../lib/admin/constants";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState(null);
  const [deleteScope, setDeleteScope] = useState('local');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteScope, setBulkDeleteScope] = useState('both');
  const [chartRange, setChartRange] = useState('30d');
  const pageSize = DEFAULT_PAGE_SIZE;

  const deleteEstimateMutation = useDeleteEstimate();
  const bulkDeleteMutation = useBulkDeleteEstimates();

  // Get estimateId from URL query for deep linking
  const estimateIdFromQuery = router.query.estimateId;
  const selectedEstimateId = estimateIdFromQuery || null;

  // Map tab to portal status filter
  const portalStatusFilter = activeTab === "all" || activeTab === "trash" ? "" : activeTab;

  // Fetch active estimates (only when not in trash tab)
  const { data, isLoading, error, refetch } = useAdminEstimates({
    search: search || undefined,
    portalStatus: portalStatusFilter || undefined,
    workflowStatus: workflowStatusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    pageSize,
    enabled: activeTab !== "trash",
  });

  // Fetch trash (only when in trash tab)
  const { 
    data: trashData, 
    isLoading: trashLoading, 
    error: trashError, 
    refetch: refetchTrash 
  } = useAdminEstimatesTrash({
    locationId: locationId || undefined,
    limit: 100,
    enabled: activeTab === "trash",
  });

  // Fetch chart data (only when not in trash tab)
  const { 
    data: chartData, 
    isLoading: chartLoading, 
    error: chartError 
  } = useAdminEstimatesChart({
    range: chartRange,
    enabled: activeTab !== "trash",
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    refetch();
  }, [queryClient, refetch]);

  const estimates = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

  // Clear selection when page, filters, or tab changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, activeTab, workflowStatusFilter]);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedIds(new Set(estimates.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [estimates]);

  // Handle individual selection
  const handleSelectItem = useCallback((estimateId, checked) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(estimateId);
      } else {
        newSelected.delete(estimateId);
      }
      return newSelected;
    });
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    const estimateIds = Array.from(selectedIds);
    if (estimateIds.length === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync({ 
        estimateIds, 
        locationId: locationId || undefined,
        scope: bulkDeleteScope 
      });
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedIds, bulkDeleteMutation, locationId, bulkDeleteScope]);

  // Handle Excel export
  const handleExportCSV = useCallback(() => {
    const estimates = data?.items || [];
    if (estimates.length === 0) return;

    // Prepare data with proper date handling
    const worksheetData = estimates.map(est => ({
      'Estimate Number': est.estimateNumber || est.id || '',
      'Title': est.title || 'ESTIMATE',
      'Customer Name': est.contactName || '',
      'Email': est.contactEmail || '',
      'Total': est.total || 0,
      'Currency': est.currency || DEFAULT_CURRENCY,
      'GHL Status': est.ghlStatus || '',
      'Portal Status': est.portalStatus || '',
      'Workflow Status': est.workflowStatus || '',
      'Created At': est.createdAt ? new Date(est.createdAt) : null,
      'Updated At': est.updatedAt ? new Date(est.updatedAt) : null,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheetData);

    // Auto-size columns to prevent truncation
    const colWidths = [
      { wch: 15 }, // Estimate Number
      { wch: 25 }, // Title
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Email
      { wch: 12 }, // Total
      { wch: 8 },  // Currency
      { wch: 12 }, // GHL Status
      { wch: 12 }, // Portal Status
      { wch: 15 }, // Workflow Status
      { wch: 20 }, // Created At
      { wch: 20 }, // Updated At
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Estimates');

    // Generate file and download
    const fileName = `estimates-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [data?.items]);

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

  const handleRowClick = useCallback((estimateId) => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, estimateId },
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const handleCloseModal = useCallback(() => {
    const { estimateId, ...restQuery } = router.query;
    router.replace(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const handleInvoiceCreated = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Get trash count for badge
  const trashCount = trashData?.count || 0;

  const statusTabs = useMemo(() => [
    { value: "all", label: "All" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { 
      value: "trash", 
      label: "Trash",
      badge: trashCount > 0 ? trashCount : undefined,
    },
  ], [trashCount]);

  // Handle delete
  const handleDeleteClick = useCallback((estimateId, locId) => {
    setEstimateToDelete({ id: estimateId, locationId: locId || locationId });
    setDeleteDialogOpen(true);
  }, [locationId]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!estimateToDelete) return;
    
    try {
      await deleteEstimateMutation.mutateAsync({
        estimateId: estimateToDelete.id,
        locationId: estimateToDelete.locationId || locationId,
        scope: deleteScope,
      });
      setDeleteDialogOpen(false);
      setEstimateToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  }, [estimateToDelete, locationId, deleteScope, deleteEstimateMutation]);

  // Handle view details
  const handleViewDetails = useCallback((estimateId) => {
    handleRowClick(estimateId);
  }, [handleRowClick]);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    Escape: (e) => {
      e.preventDefault();
      if (deleteDialogOpen) {
        setDeleteDialogOpen(false);
      }
    },
  }), [deleteDialogOpen]);

  useKeyboardShortcuts(shortcuts, true, [deleteDialogOpen]);

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
          {/* Chart Section - Only show when not in trash */}
          {activeTab !== "trash" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                  <p className="text-sm text-muted-foreground">Track estimate activity over time</p>
                </div>
                <TimeRangeSelector value={chartRange} onChange={setChartRange} />
              </div>
              <EstimatesChart 
                data={chartData?.data} 
                isLoading={chartLoading}
                error={chartError}
                range={chartRange}
              />
            </div>
          )}

          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl -z-10" />
            <div className="flex items-start justify-between p-6 rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Estimates
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create and manage all estimates generated for your business
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  disabled={!data?.items?.length || isLoading}
                  className="flex items-center gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button variant="outline" size="icon" className="border-border/60 hover:border-primary/50 hover:bg-primary/5">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="default" className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  New Estimate
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              label="Sent Estimates"
              value={summaryMetrics.sent.total}
              currency={DEFAULT_CURRENCY}
              variant="sent"
            />
            <SummaryCard
              label="Accepted"
              value={summaryMetrics.accepted.total}
              currency={DEFAULT_CURRENCY}
              variant="accepted"
            />
            <SummaryCard
              label="Declined"
              value={summaryMetrics.declined.total}
              currency={DEFAULT_CURRENCY}
              variant="declined"
            />
            <SummaryCard
              label="Invoiced"
              value={summaryMetrics.invoiced.total}
              currency={DEFAULT_CURRENCY}
              variant="invoiced"
            />
          </div>

          {/* Status Tabs */}
          <StatusTabs tabs={statusTabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Trash View */}
          {activeTab === "trash" ? (
            <TrashView
              items={trashData?.items || []}
              isLoading={trashLoading}
              error={trashError}
              onRetry={refetchTrash}
              onViewDetails={handleViewDetails}
              locationId={locationId}
            />
          ) : (
            <>
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
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-surface to-surface-2 p-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No estimates found</h3>
                  <p className="text-sm text-muted-foreground">
                    {search || startDate || endDate || workflowStatusFilter
                      ? "Try adjusting your filters to see more results"
                      : "Get started by creating your first estimate"}
                  </p>
                </div>
                {!search && !startDate && !endDate && !workflowStatusFilter && (
                  <Button 
                    variant="default" 
                    className="mt-4 bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/20"
                    onClick={() => {/* Handle new estimate */}}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Estimate
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {estimates.map((estimate) => {
                  const isSelected = selectedIds.has(estimate.id);
                  return (
                    <div
                      key={estimate.id}
                      onClick={() => handleRowClick(estimate.id)}
                      className={`bg-surface rounded-xl border border-border/60 p-5 shadow-sm cursor-pointer transition-all duration-200 ease-standard hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] ${isSelected ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectItem(estimate.id, e.target.checked);
                            }}
                            aria-label={`Select estimate ${estimate.id}`}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-sm mb-1">
                              {estimate.title || "ESTIMATE"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              #{estimate.estimateNumber || estimate.id}
                            </p>
                          </div>
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
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Value</p>
                          <p className="text-base font-bold text-primary">
                            {estimate.total > 0
                              ? `${estimate.currency || DEFAULT_CURRENCY} ${estimate.total.toFixed(2)}`
                              : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                          <p className="text-sm font-medium text-foreground">
                            {estimate.createdAt
                              ? new Date(estimate.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <Checkbox
                            checked={estimates.length > 0 && selectedIds.size === estimates.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            aria-label="Select all"
                          />
                        </th>
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
                      {estimates.map((estimate) => {
                        const isSelected = selectedIds.has(estimate.id);
                        return (
                        <tr
                          key={estimate.id}
                          className={`cursor-pointer transition-all duration-200 ease-standard hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent ${isSelected ? 'bg-primary/10 ring-2 ring-primary/20' : ''}`}
                          onClick={() => handleRowClick(estimate.id)}
                        >
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleSelectItem(estimate.id, e.target.checked)}
                              aria-label={`Select estimate ${estimate.id}`}
                            />
                          </td>
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
                            <EstimateActionsMenu
                              estimateId={estimate.id}
                              isInTrash={false}
                              onViewDetails={handleViewDetails}
                              onMoveToTrash={handleDeleteClick}
                              locationId={locationId || estimate.locationId}
                              linkedInvoiceId={estimate.linkedInvoiceId}
                            />
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-gradient-to-r from-surface/80 to-surface/60 backdrop-blur-sm px-6 py-4 border-t border-border/60 rounded-b-xl">
                  <p className="text-sm font-medium text-muted-foreground">
                    Showing <span className="text-foreground font-semibold">{((page - 1) * pageSize) + 1}</span> to <span className="text-foreground font-semibold">{Math.min(page * pageSize, total)}</span> of <span className="text-foreground font-semibold">{total}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                      className="border-border/60 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      variant="outline"
                      size="sm"
                      className="border-border/60 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </>
          )}

          {/* Floating Action Bar */}
          {activeTab !== "trash" && (
            <FloatingActionBar
              selectedCount={selectedIds.size}
              onClearSelection={() => setSelectedIds(new Set())}
              onDeleteSelected={() => setBulkDeleteDialogOpen(true)}
              isLoading={bulkDeleteMutation.isPending}
            />
          )}
        </div>

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onConfirm={handleBulkDelete}
          itemCount={selectedIds.size}
          isLoading={bulkDeleteMutation.isPending}
          showScopeSelection={true}
          scope={bulkDeleteScope}
          onScopeChange={setBulkDeleteScope}
          itemType="Estimate"
          trashMode={true}
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Move to Trash"
          description={estimateToDelete 
            ? `This estimate will be moved to trash and can be restored within 30 days.`
            : undefined
          }
          itemName={estimateToDelete?.id}
          isLoading={deleteEstimateMutation.isPending}
          showScopeSelection={true}
          scope={deleteScope}
          onScopeChange={setDeleteScope}
          trashMode={true}
        />

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

export async function getServerSideProps(ctx) {
  const authCheck = await requireAdmin(ctx, { notFound: true });
  if (authCheck.notFound || authCheck.redirect) {
    return authCheck;
  }
  return { props: { ...(authCheck.props || {}) } };
}
