import { useState } from "react";
import Head from "next/head";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Spinner } from "../../../components/ui/spinner";
import { Database, Zap, CheckCircle2, XCircle, TrendingUp, TrendingDown, Download } from "lucide-react";

const formatTime = (ms) => {
  if (ms === null || ms === undefined) return "N/A";
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function BenchmarkTestPage() {
  const [config, setConfig] = useState({
    limit: 50,
    warmupRuns: 2,
    recordRuns: 5,
    mode: "sequential",
    includeFullData: false,
    debug: false,
    locationId: "",
  });
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams();
      params.set("limit", String(config.limit));
      params.set("warmupRuns", String(config.warmupRuns));
      params.set("recordRuns", String(config.recordRuns));
      params.set("mode", config.mode);
      if (config.includeFullData) params.set("includeFullData", "true");
      if (config.debug) params.set("debug", "1");
      if (config.locationId) params.set("locationId", config.locationId);

      const response = await fetch(`/api/admin/testing/benchmark?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { err: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.err || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `benchmark-${results.testId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>Superadmin • Benchmark Test</title>
      </Head>
      <AdminLayout title="Benchmark Test (Temporary)">
        <div className="space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure benchmark parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Limit</label>
                  <input
                    type="number"
                    value={config.limit}
                    onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) || 50 })}
                    min="1"
                    max="500"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warm-up Runs</label>
                  <input
                    type="number"
                    value={config.warmupRuns}
                    onChange={(e) => setConfig({ ...config, warmupRuns: parseInt(e.target.value) || 2 })}
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recorded Runs</label>
                  <input
                    type="number"
                    value={config.recordRuns}
                    onChange={(e) => setConfig({ ...config, recordRuns: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mode</label>
                  <select
                    value={config.mode}
                    onChange={(e) => setConfig({ ...config, mode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled={isRunning}
                  >
                    <option value="sequential">Sequential</option>
                    <option value="parallel">Parallel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location ID (optional)</label>
                  <input
                    type="text"
                    value={config.locationId}
                    onChange={(e) => setConfig({ ...config, locationId: e.target.value })}
                    placeholder="Leave empty for default"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeFullData}
                      onChange={(e) => setConfig({ ...config, includeFullData: e.target.checked })}
                      disabled={isRunning}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include Full Data</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.debug}
                      onChange={(e) => setConfig({ ...config, debug: e.target.checked })}
                      disabled={isRunning}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Debug Mode</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={runBenchmark}
                  disabled={isRunning}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Spinner size="sm" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Run Benchmark
                    </>
                  )}
                </button>
                {results && (
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted/40 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-destructive">
                  <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results && (
            <>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      <CardTitle>Database Statistics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Source Time:</span>
                        <span className="font-mono font-semibold">
                          {formatTime(results.statistics?.database?.avgSourceTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Min:</span>
                        <span className="font-mono">{formatTime(results.statistics?.database?.minSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max:</span>
                        <span className="font-mono">{formatTime(results.statistics?.database?.maxSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Std Dev:</span>
                        <span className="font-mono">{formatTime(results.statistics?.database?.stdDevSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg End-to-End:</span>
                        <span className="font-mono">
                          {formatTime(results.statistics?.database?.avgEndToEndMs)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-secondary" />
                      <CardTitle>GHL Statistics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Source Time:</span>
                        <span className="font-mono font-semibold">
                          {formatTime(results.statistics?.ghl?.avgSourceTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Min:</span>
                        <span className="font-mono">{formatTime(results.statistics?.ghl?.minSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max:</span>
                        <span className="font-mono">{formatTime(results.statistics?.ghl?.maxSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Std Dev:</span>
                        <span className="font-mono">{formatTime(results.statistics?.ghl?.stdDevSourceTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg End-to-End:</span>
                        <span className="font-mono">{formatTime(results.statistics?.ghl?.avgEndToEndMs)}</span>
                      </div>
                      {results.statistics?.ghl?.throttledRuns > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Throttled Runs:</span>
                          <Badge variant="warning">{results.statistics.ghl.throttledRuns}</Badge>
                        </div>
                      )}
                      {results.statistics?.ghl?.timeoutRuns > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Timeout Runs:</span>
                          <Badge variant="destructive">{results.statistics.ghl.timeoutRuns}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-info-bg border border-info/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Speed Winner</p>
                      <div className="flex items-center justify-center gap-2">
                        {results.statistics?.comparison?.avgSpeedDifference !== null &&
                        results.statistics?.comparison?.avgSpeedDifference !== undefined ? (
                          results.statistics.comparison.avgSpeedDifference < 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-success" />
                              <Badge variant="success">Database</Badge>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-warning" />
                              <Badge variant="warning">GHL</Badge>
                            </>
                          )
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                      {results.statistics?.comparison?.avgSpeedDifference !== null &&
                        results.statistics?.comparison?.avgSpeedDifference !== undefined && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {Math.abs(results.statistics.comparison.avgSpeedDifference).toFixed(2)}ms difference
                          </p>
                        )}
                    </div>
                    <div className="text-center p-4 bg-info-bg border border-info/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Match Rate</p>
                      <p className="text-2xl font-bold">
                        {results.statistics?.comparison?.avgMatchRate !== null &&
                         results.statistics?.comparison?.avgMatchRate !== undefined
                          ? results.statistics.comparison.avgMatchRate.toFixed(1)
                          : "0"}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-info-bg border border-info/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Test ID</p>
                      <p className="text-xs font-mono">{results.testId}</p>
                    </div>
                    <div className="text-center p-4 bg-info-bg border border-info/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                      <p className="text-xs">
                        {results.timestamp ? new Date(results.timestamp).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Per-Run Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Per-Run Results</CardTitle>
                  <CardDescription>{results.results?.length || 0} recorded runs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.results?.map((run, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Run {run.run}</span>
                            <Badge variant="outline">{formatTime(run.totalMs)} total</Badge>
                          </div>
                          {run.comparison?.sourceTimeFaster && (
                            <Badge
                              variant={run.comparison.sourceTimeFaster === "database" ? "success" : "warning"}
                            >
                              {run.comparison.sourceTimeFaster === "database" ? "DB Faster" : "GHL Faster"}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Database</span>
                              {run.database.success ? (
                                <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive ml-auto" />
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source:</span>
                                <span className="font-mono">{formatTime(run.database.sourceMs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">End-to-End:</span>
                                <span className="font-mono">{formatTime(run.database.endToEndMs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Count:</span>
                                <span>{run.database.count}</span>
                              </div>
                              {run.database.error && (
                                <div className="text-destructive text-xs mt-1">{run.database.error}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-secondary" />
                              <span className="text-sm font-medium">GHL</span>
                              {run.ghl.success ? (
                                <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive ml-auto" />
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source:</span>
                                <span className="font-mono">{formatTime(run.ghl.sourceMs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">End-to-End:</span>
                                <span className="font-mono">{formatTime(run.ghl.endToEndMs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Count:</span>
                                <span>{run.ghl.count}</span>
                              </div>
                              {run.ghl.throttled && <Badge variant="warning" className="text-xs">Throttled</Badge>}
                              {run.ghl.timeout && <Badge variant="destructive" className="text-xs">Timeout</Badge>}
                              {run.ghl.error && (
                                <div className="text-destructive text-xs mt-1">{run.ghl.error}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        {run.comparison?.matchRate !== undefined && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Match Rate:</span>
                              <span className="font-semibold">{run.comparison.matchRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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
