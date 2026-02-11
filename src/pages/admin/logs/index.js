import Head from "next/head";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useState, useCallback } from "react";
import { useDebouncedValue } from "../../../lib/hooks/useDebounce";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import { HealthStatusCard } from "../../../components/admin/HealthStatusCard";
import { useAdminLogs } from "../../../lib/react-query/hooks/admin/use-admin-logs";
import { Spinner } from "../../../components/ui/spinner";
import { RefreshCw, Search } from "lucide-react";
import { getLevelIcon, getLevelColor, formatTimestamp, formatFileSize, getLogKey } from "../../../lib/admin/utils/log-utils";

export default function AdminLogs({ authContext }) {
  const [limit, setLimit] = useState(100);
  const [level, setLevel] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [requestId, setRequestId] = useState("");

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { data, isLoading, error, refetch, isRefetching } = useAdminLogs({
    limit,
    level,
    search: debouncedSearch,
    requestId,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <Head>
        <title>Superadmin • Logs</title>
      </Head>
      <AdminLayout title="Logs" authContext={authContext}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Error log tail</CardTitle>
                <CardDescription>
                  {data?.total !== undefined 
                    ? `Showing ${data.total} log entries${data.file_size ? ` (${formatFileSize(data.file_size)})` : ''}`
                    : "Loading logs..."}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefetching || isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Level
                  </label>
                  <Select value={level} onValueChange={setLevel} disabled={isLoading || isRefetching}>
                    <SelectTrigger aria-label="Filter by log level">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block" id="search-logs-description">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className={`pl-8 ${searchInput !== debouncedSearch ? 'pr-8' : ''}`}
                      disabled={isLoading || isRefetching}
                      aria-label="Search logs"
                      aria-describedby="search-logs-description"
                    />
                    {searchInput !== debouncedSearch && (
                      <div className="absolute right-2 top-2.5">
                        <Spinner size="xs" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Request ID
                  </label>
                  <Input
                    placeholder="Filter by request ID"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    disabled={isLoading || isRefetching}
                    aria-label="Filter by request ID"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Limit
                  </label>
                  <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v, 10))} disabled={isLoading || isRefetching}>
                    <SelectTrigger aria-label="Number of log entries to display">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Logs Display */}
              {isLoading && !data ? (
                // Initial load - show full loading state
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-8" role="status" aria-live="polite">
                  <Spinner size="sm" />
                  <span>Loading logs...</span>
                </div>
              ) : error ? (
                // Error state - only show if not a cancelled request
                (error?.message && error.message !== 'Request cancelled') && (
                  <div className="rounded-md border border-error/30 bg-error-bg p-4 text-sm text-error">
                    <p className="font-semibold">Failed to load logs</p>
                    <p className="mt-1">{error?.message || 'An unknown error occurred'}</p>
                  </div>
                )
              ) : data?.logs && Array.isArray(data.logs) && data.logs.length > 0 ? (
                // Show data with optional refetching indicator
                <>
                  {isRefetching && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2" role="status" aria-live="polite">
                      <Spinner size="xs" />
                      <span>Refreshing...</span>
                    </div>
                  )}
                  <div className="max-h-[600px] overflow-auto rounded-md border border-border/60 bg-background">
                    <div className="divide-y divide-border">
                      {data.logs.map((log, index) => {
                        // Validate log structure
                        if (!log || typeof log !== 'object') {
                          return null;
                        }
                        
                        return (
                          <div
                            key={getLogKey(log, index)}
                            className="p-3 hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getLevelIcon(log?.level)}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-medium ${getLevelColor(log?.level)} uppercase`}>
                                    {log?.level || 'unknown'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {log?.timestamp ? formatTimestamp(log.timestamp) : 'No timestamp'}
                                  </span>
                                  {log?.request_id && (
                                    <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                      {log.request_id.length > 8 
                                        ? `${log.request_id.substring(0, 8)}...` 
                                        : log.request_id}
                                    </span>
                                  )}
                                  {log?.user_id && (
                                    <span className="text-xs text-muted-foreground">
                                      User: {log.user_id}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-foreground break-words">
                                  {log?.message || 'No message'}
                                </p>
                                {log?.context && Object.keys(log.context).length > 0 && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                      Context ({Object.keys(log.context).length} fields)
                                    </summary>
                                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {(() => {
                                        // Safe JSON.stringify with error handling
                                        try {
                                          return JSON.stringify(log.context, null, 2);
                                        } catch (e) {
                                          return '[Error displaying context: ' + (e instanceof Error ? e.message : 'Unknown error') + ']';
                                        }
                                      })()}
                                    </pre>
                                  </details>
                                )}
                                {log?.format === 'json' && log?.raw && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                      Raw JSON
                                    </summary>
                                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {log.raw}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                // No logs found
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No logs found
                </div>
              )}
            </CardContent>
          </Card>
          <HealthStatusCard showRefreshButton={true} autoRefresh={false} />
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
