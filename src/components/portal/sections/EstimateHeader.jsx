import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { formatAddress } from "@/components/portal/utils/portal-utils";

export function EstimateHeader({ estimate, progress, estimates, total, hasPhotos, onBackToList, onSelectEstimate, menuOpen, setMenuOpen }) {
  // Use statusValue if available (actual status), otherwise use status (display label)
  // Portal uses: sent, accepted, rejected (not pending)
  const statusValue = estimate?.statusValue || estimate?.status || "sent";
  const statusDisplay = estimate?.status || "Sent";
  const needsPhotos = !hasPhotos && statusValue !== "accepted";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <header className="rounded-[32px] border border-border-subtle bg-background p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Estimate control center</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{estimate.label}</h1>
          <p className="text-sm text-muted-foreground">
            Every quote, photo request, approval, and install milestone lives here. Switch sites without leaving the
            portal.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-muted p-4 text-right shadow-inner">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-semibold text-foreground" suppressHydrationWarning>
            {statusDisplay}
          </p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            Progress {progress}%
          </p>
        </div>
      </div>

      {/* Total Price Section */}
      {total !== null && total !== undefined && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Estimated Total</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {mounted
                  ? `$${total.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${total.toFixed(2)}`}
              </p>
              {needsPhotos ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  This is an initial estimate based on standard pricing. Upload photos of your property to receive a personalized quote that may reduce your total cost.
                </p>
              ) : (
                <p className="mt-2 text-sm text-success">
                  ✓ Photos reviewed • Final pricing confirmed
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 rounded-3xl border border-border-subtle bg-surface/60 p-4 shadow-inner text-sm text-foreground lg:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Site address</p>
          <p className="mt-1 font-semibold text-foreground">{formatAddress(estimate.meta.address) || "Site address pending"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Base package</p>
          <p className="mt-1 font-semibold text-foreground">{estimate.meta.package}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Customer</p>
          <p className="mt-1 font-semibold text-foreground">{estimate.meta.customer}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:bg-muted"
        >
          Back to list
        </button>
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-border-strong"
          >
            Switch estimate
            <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen && estimates.length > 0 && (
            <div className="absolute z-20 mt-3 w-72 rounded-2xl border border-border-subtle bg-background p-2 shadow-2xl">
              {estimates.map((est) => {
                const estId = est.estimateId || est.id;
                return (
                  <button
                    key={estId}
                    type="button"
                    onClick={() => {
                      onSelectEstimate(estId);
                      setMenuOpen(false);
                    }}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-muted ${
                      estimate.id === estId.toString() ? "border border-primary/30 bg-primary/5" : ""
                    }`}
                  >
                    <p className="font-semibold text-foreground">
                      {est.label || `Estimate #${est.number || estId}`}
                    </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatAddress(est.address || est.meta?.address) || "Site address pending"}
                                </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Currently viewing #{estimate.id}</p>
      </div>
    </header>
  );
}

