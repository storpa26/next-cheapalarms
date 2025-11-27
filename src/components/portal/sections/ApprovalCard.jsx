import { ArrowRight, Shield, Sparkles } from "lucide-react";

export function ApprovalCard({ view }) {
  const total = view?.quote?.total || 0;
  const scheduledFor = view?.installation?.scheduledFor;
  const canApprove = view?.quote?.status === "accepted";

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Approval & payment</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Finalize estimate</h3>
          <p className="text-sm text-slate-500">
            The button unlocks once our ops team reviews your photos and refreshes pricing.
          </p>
        </div>
        <div className="rounded-full bg-secondary/15 p-4">
          <Shield className="h-6 w-6 text-secondary" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Estimate total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {total > 0 ? `$${total.toLocaleString("en-AU")}` : "—"}
          </p>
          <p className="text-xs text-slate-500">Updates once photos approved</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Install window</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {scheduledFor
              ? new Date(scheduledFor).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD"}
          </p>
          <p className="text-xs text-slate-500">Tentative until approval</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        {["Review summary", "Approve instantly", "Pay securely"].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-xl border border-white px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-slate-900">{item}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!canApprove}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Approve & Pay <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

