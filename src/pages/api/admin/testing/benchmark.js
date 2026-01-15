import { createHash } from 'crypto';
import { createWpHeaders, getWpBase } from '../../../../lib/api/wp-proxy';

/**
 * Server-side benchmark endpoint to compare WordPress-DB fetch vs WordPress→GHL fetch (Estimates)
 * 
 * Note: GHL endpoint uses WordPress transients (cached), so after warm-up it may appear faster.
 * On production, DB should be faster since it's on the same server (no network overhead).
 * 
 * Query params:
 * - limit: number (default: 50)
 * - warmupRuns: number (default: 2)
 * - recordRuns: number (default: 5)
 * - mode: "sequential" | "parallel" (default: "sequential")
 * - includeFullData: boolean (default: false)
 * - debug: 0 | 1 (default: 0)
 * - locationId: string (optional, will use default from WordPress)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, err: 'Method not allowed' });
  }

  try {
    // Parse query parameters
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit || '50', 10)));
    const warmupRuns = Math.max(0, Math.min(10, parseInt(req.query.warmupRuns || '2', 10)));
    const recordRuns = Math.max(1, Math.min(20, parseInt(req.query.recordRuns || '5', 10)));
    const mode = req.query.mode === 'parallel' ? 'parallel' : 'sequential';
    const includeFullData = req.query.includeFullData === 'true' || req.query.includeFullData === '1';
    const debug = req.query.debug === '1' || req.query.debug === 'true';
    const locationId = req.query.locationId || null;

    const wpBase = getWpBase();
    if (!wpBase) {
      return res.status(500).json({ ok: false, err: 'WP API base not configured' });
    }

    const headers = createWpHeaders(req);

    // Helper to round to 2 decimals
    const round2 = (n) => Math.round((n || 0) * 100) / 100;

    // Helper to create SHA256 hash of IDs
    const hashIds = (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) return null;
      const sorted = [...ids].sort().join(',');
      return createHash('sha256').update(sorted).digest('hex');
    };

    // Helper to extract IDs from estimates
    const extractIds = (items) => {
      if (!Array.isArray(items)) return [];
      return items
        .map(item => item.id || item.estimateId || item.estimateNumber)
        .filter(Boolean)
        .map(String);
    };

    // Helper to calculate match rate
    const calculateMatchRate = (dbIds, ghlIds) => {
      if (!dbIds.length || !ghlIds.length) return 0;
      const dbSet = new Set(dbIds);
      const ghlSet = new Set(ghlIds);
      const intersection = [...dbSet].filter(id => ghlSet.has(id));
      return round2((intersection.length / Math.max(dbIds.length, ghlIds.length)) * 100);
    };

    // Fetch from WordPress DB (admin/estimates endpoint)
    const fetchDbEstimates = async ({ limit: fetchLimit, locationId: fetchLocationId }) => {
      const startTime = performance.now();
      const params = new URLSearchParams();
      params.set('pageSize', String(fetchLimit));
      params.set('page', '1');
      if (fetchLocationId) {
        params.set('locationId', fetchLocationId);
      }

      const url = `${wpBase}/ca/v1/admin/estimates?${params.toString()}`;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const sourceTime = round2(performance.now() - startTime);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
            sourceTime,
            statusCode: response.status,
          };
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          return {
            success: false,
            error: `Invalid JSON response: ${parseError.message || 'Unknown parse error'}`,
            sourceTime,
            statusCode: response.status,
          };
        }

        const endToEndTime = round2(performance.now() - startTime);
        const overhead = round2(endToEndTime - sourceTime);

        const items = data.items || data.estimates || [];
        const ids = extractIds(items);
        const sampleIds = ids.slice(0, 3);
        const idHash = hashIds(ids);

        return {
          success: true,
          sourceTime,
          endToEndTime,
          overhead,
          count: items.length,
          sampleIds,
          idHash,
          ids, // Store IDs for match rate calculation
          statusCode: response.status,
          data: includeFullData ? items : undefined,
        };
      } catch (error) {
        const sourceTime = round2(performance.now() - startTime);
        return {
          success: false,
          error: error.name === 'AbortError' 
            ? 'Request timeout (15s exceeded)'
            : error.message || 'Unknown error',
          sourceTime,
          timeout: error.name === 'AbortError',
        };
      }
    };

    // Fetch from WordPress→GHL (estimate/list endpoint)
    const fetchGhlEstimates = async ({ limit: fetchLimit, locationId: fetchLocationId }) => {
      const startTime = performance.now();
      const params = new URLSearchParams();
      params.set('limit', String(fetchLimit));
      if (fetchLocationId) {
        params.set('locationId', fetchLocationId);
      }

      const url = `${wpBase}/ca/v1/estimate/list?${params.toString()}`;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const sourceTime = round2(performance.now() - startTime);

        // Extract rate limit headers
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        const throttled = response.status === 429;

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
            sourceTime,
            statusCode: response.status,
            throttled,
            rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
            rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null,
            timeout: false,
            retryCount: 0,
          };
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          return {
            success: false,
            error: `Invalid JSON response: ${parseError.message || 'Unknown parse error'}`,
            sourceTime,
            statusCode: response.status,
            throttled,
            rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
            rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null,
            timeout: false,
            retryCount: 0,
          };
        }

        const endToEndTime = round2(performance.now() - startTime);
        const overhead = round2(endToEndTime - sourceTime);

        const items = data.items || data.estimates || [];
        const ids = extractIds(items);
        const sampleIds = ids.slice(0, 3);
        const idHash = hashIds(ids);

        return {
          success: true,
          sourceTime,
          endToEndTime,
          overhead,
          count: items.length,
          sampleIds,
          idHash,
          ids, // Store IDs for match rate calculation
          statusCode: response.status,
          throttled: false,
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
          rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null,
          timeout: false,
          retryCount: 0,
          data: includeFullData ? items : undefined,
        };
      } catch (error) {
        const sourceTime = round2(performance.now() - startTime);
        return {
          success: false,
          error: error.name === 'AbortError' 
            ? 'Request timeout (15s exceeded)'
            : error.message || 'Unknown error',
          sourceTime,
          timeout: error.name === 'AbortError',
          throttled: false,
          retryCount: 0,
        };
      }
    };

    // Run a single benchmark iteration
    const runBenchmark = async (runNumber, isWarmup = false) => {
      const runStartTime = performance.now();
      
      let dbResult, ghlResult;

      if (mode === 'parallel') {
        const results = await Promise.allSettled([
          fetchDbEstimates({ limit, locationId }),
          fetchGhlEstimates({ limit, locationId }),
        ]);
        dbResult = results[0].status === 'fulfilled' 
          ? results[0].value 
          : { 
              success: false, 
              error: results[0].reason?.message || 
                     (results[0].reason instanceof Error ? results[0].reason.toString() : 'Unknown error')
            };
        ghlResult = results[1].status === 'fulfilled' 
          ? results[1].value 
          : { 
              success: false, 
              error: results[1].reason?.message || 
                     (results[1].reason instanceof Error ? results[1].reason.toString() : 'Unknown error')
            };
      } else {
        dbResult = await fetchDbEstimates({ limit, locationId });
        ghlResult = await fetchGhlEstimates({ limit, locationId });
      }

      const totalMs = round2(performance.now() - runStartTime);

      // Calculate comparison metrics
      const dbIds = dbResult.success && dbResult.ids ? dbResult.ids : [];
      const ghlIds = ghlResult.success && ghlResult.ids ? ghlResult.ids : [];
      const matchRate = calculateMatchRate(dbIds, ghlIds);

      const comparison = {
        sourceTimeDifference: dbResult.success && ghlResult.success
          ? round2(ghlResult.sourceTime - dbResult.sourceTime)
          : null,
        sourceTimeFaster: dbResult.success && ghlResult.success
          ? (dbResult.sourceTime < ghlResult.sourceTime ? 'database' : 'ghl')
          : null,
        endToEndDifference: dbResult.success && ghlResult.success
          ? round2(ghlResult.endToEndTime - dbResult.endToEndTime)
          : null,
        endToEndFaster: dbResult.success && ghlResult.success
          ? (dbResult.endToEndTime < ghlResult.endToEndTime ? 'database' : 'ghl')
          : null,
        matchRate,
        countDifference: dbResult.success && ghlResult.success
          ? (dbResult.count - ghlResult.count)
          : null,
      };

      return {
        run: runNumber,
        isWarmup,
        totalMs,
        database: {
          sourceMs: dbResult.sourceTime ?? null,
          endToEndMs: dbResult.endToEndTime ?? null,
          overheadMs: dbResult.overhead ?? null,
          count: dbResult.count || 0,
          sampleIds: dbResult.sampleIds || [],
          idHash: dbResult.idHash || null,
          success: dbResult.success,
          error: dbResult.error || null,
          statusCode: dbResult.statusCode || null,
          ...(includeFullData && dbResult.data ? { data: dbResult.data } : {}),
          ...(debug && dbResult.ids ? { allIds: dbResult.ids } : {}),
        },
        ghl: {
          sourceMs: ghlResult.sourceTime ?? null,
          endToEndMs: ghlResult.endToEndTime ?? null,
          overheadMs: ghlResult.overhead ?? null,
          count: ghlResult.count || 0,
          sampleIds: ghlResult.sampleIds || [],
          idHash: ghlResult.idHash || null,
          statusCode: ghlResult.statusCode || null,
          throttled: ghlResult.throttled || false,
          timeout: ghlResult.timeout || false,
          rateLimitRemaining: ghlResult.rateLimitRemaining,
          rateLimitReset: ghlResult.rateLimitReset,
          retryCount: ghlResult.retryCount || 0,
          success: ghlResult.success,
          error: ghlResult.error || null,
          ...(includeFullData && ghlResult.data ? { data: ghlResult.data } : {}),
          ...(debug && ghlResult.ids ? { allIds: ghlResult.ids } : {}),
        },
        comparison,
      };
    };

    // Warm-up phase
    const warmupResults = [];
    for (let i = 1; i <= warmupRuns; i++) {
      const result = await runBenchmark(i, true);
      warmupResults.push(result);
      
      // If warm-up fails completely, abort
      if (!result.database.success && !result.ghl.success) {
        return res.status(500).json({
          ok: false,
          err: 'Warm-up phase failed completely',
          warmupErrors: {
            database: result.database.error,
            ghl: result.ghl.error,
          },
        });
      }
    }

    // Recorded runs phase
    const recordedResults = [];
    for (let i = 1; i <= recordRuns; i++) {
      const result = await runBenchmark(warmupRuns + i, false);
      recordedResults.push(result);
    }

    // Calculate statistics
    // Filter out null, undefined, NaN, and zero values (failed runs)
    const dbSourceTimes = recordedResults
      .map(r => r.database?.sourceMs)
      .filter(t => t !== null && t !== undefined && !isNaN(t) && t > 0);
    const ghlSourceTimes = recordedResults
      .map(r => r.ghl?.sourceMs)
      .filter(t => t !== null && t !== undefined && !isNaN(t) && t > 0);

    const calculateStats = (values) => {
      if (values.length === 0) {
        return { avg: null, min: null, max: null, stdDev: null, count: 0 };
      }
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      return {
        avg: round2(avg),
        min: round2(min),
        max: round2(max),
        stdDev: round2(stdDev),
        count: values.length,
      };
    };

    const dbStats = calculateStats(dbSourceTimes);
    const ghlStats = calculateStats(ghlSourceTimes);

    // Check if all recorded runs failed
    const allFailed = recordedResults.every(r => !r.database.success && !r.ghl.success);
    if (allFailed) {
      return res.status(500).json({
        ok: false,
        err: 'All recorded runs failed',
        errors: recordedResults.map(r => ({
          run: r.run,
          database: r.database.error,
          ghl: r.ghl.error,
        })),
      });
    }

    // Build response
    const response = {
      ok: true,
      testId: Date.now(),
      timestamp: new Date().toISOString(),
      config: {
        limit,
        warmupRuns,
        recordRuns,
        mode,
        includeFullData,
        locationId,
      },
      warmup: {
        completed: true,
        runs: warmupRuns,
        ...(debug ? { results: warmupResults } : {}),
      },
      results: recordedResults,
      statistics: {
        database: {
          ...dbStats,
          avgEndToEndMs: (() => {
            const values = recordedResults
              .map(r => r.database.endToEndMs)
              .filter(t => t !== null && t !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
          avgOverheadMs: (() => {
            const values = recordedResults
              .map(r => r.database.overheadMs)
              .filter(t => t !== null && t !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
        },
        ghl: {
          ...ghlStats,
          avgEndToEndMs: (() => {
            const values = recordedResults
              .map(r => r.ghl.endToEndMs)
              .filter(t => t !== null && t !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
          avgOverheadMs: (() => {
            const values = recordedResults
              .map(r => r.ghl.overheadMs)
              .filter(t => t !== null && t !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
          avgRateLimitRemaining: (() => {
            const values = recordedResults
              .map(r => r.ghl.rateLimitRemaining)
              .filter(r => r !== null && r !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
          throttledRuns: recordedResults.filter(r => r.ghl.throttled).length,
          timeoutRuns: recordedResults.filter(r => r.ghl.timeout).length,
        },
        comparison: {
          avgSpeedDifference: (() => {
            const values = recordedResults
              .map(r => r.comparison.sourceTimeDifference)
              .filter(d => d !== null && d !== undefined);
            return values.length > 0 
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
          avgMatchRate: (() => {
            const values = recordedResults
              .map(r => r.comparison.matchRate)
              .filter(m => m !== null && m !== undefined && !isNaN(m));
            return values.length > 0
              ? round2(values.reduce((a, b) => a + b, 0) / values.length)
              : null;
          })(),
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      err: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
