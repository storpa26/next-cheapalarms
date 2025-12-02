import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatAddress } from "@/components/portal/utils/portal-utils";

export function EstimatesListView({ estimates, loading, error, onSelectEstimate, resumeEstimate }) {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">My estimates</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Select a project</h1>
          <p className="text-sm text-slate-500">
            Pick an estimate to continue. We&apos;ll remember your last viewed site for next time.
          </p>
        </div>
        {resumeEstimate && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right shadow-inner">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Resume last viewed</p>
            <p className="text-sm font-semibold text-slate-900">
              {resumeEstimate.label || `Estimate #${resumeEstimate.number || resumeEstimate.estimateId}`}
            </p>
            <button
              type="button"
              onClick={() => onSelectEstimate(resumeEstimate.estimateId || resumeEstimate.id)}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100"
            >
              Resume <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="text-sm font-semibold">Error loading estimates</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      ) : estimates.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {estimates.map((estimate) => {
            const estId = estimate.estimateId || estimate.id;
            const estNumber = estimate.number || estimate.estimateNumber || estId;
            const estStatus = estimate.statusLabel || estimate.status || "Sent";
            return (
              <div
                key={estId}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">#{estNumber}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {estimate.label || `Estimate #${estNumber}`}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    {estStatus}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {formatAddress(estimate.address || estimate.meta?.address) || "Site address pending"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Progress</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {estimate.status === "accepted" ? 82 : estimate.photosCount > 0 ? 56 : 32}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectEstimate(estId)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100"
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No estimates found. Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}

