import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function AddonDetailModal({ addon, open, onClose, onAdd, quantity = 0 }) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !addon) return null;

  const detail = addon.details ?? {};
  const stats = detail.keyStats ?? [];
  const bestFor = detail.bestFor ?? [];
  const avoidIf = detail.avoidIf ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 mx-4 flex w-full max-w-5xl flex-col gap-6 rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-950 to-black p-1 text-white shadow-2xl lg:flex-row">
        <div className="rounded-[28px] bg-slate-950/40 p-6 lg:w-3/5">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 shadow-inner">
            {detail.heroVideo ? (
              <video
                src={detail.heroVideo}
                poster={detail.heroPoster}
                className="h-72 w-full object-cover lg:h-[420px]"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div
                className="flex h-72 items-center justify-center bg-gradient-to-br from-primary/40 to-primary/10 text-3xl font-semibold lg:h-[420px]"
                aria-label="Addon visual"
              >
                {addon.name}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.map((stat) => (
              <span
                key={stat}
                className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] bg-white text-slate-900 lg:w-2/5">
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary">Add-on insight</p>
                <h2 className="text-2xl font-semibold text-slate-900">{addon.name}</h2>
                <p className="text-sm text-slate-600">{detail.tagline || addon.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {detail.doINeedThis ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Do I need this?
                </div>
                <p className="mt-1 text-slate-700">{detail.doINeedThis}</p>
              </div>
            ) : null}
            <div className="grid gap-3 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best for</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {bestFor.length > 0 ? (
                    bestFor.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>Any Ajax Hub 2 deployment needing flexible coverage.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Skip if / watch-outs
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {avoidIf.length > 0 ? (
                    avoidIf.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>Not required for minimal-entry apartments.</li>
                  )}
                </ul>
              </div>
            </div>
            {detail.howItWorks ? (
              <div className="rounded-2xl border border-slate-200 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How it works
                </div>
                <p className="mt-1 text-slate-700">{detail.howItWorks}</p>
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onAdd}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add to quote ({quantity})
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

