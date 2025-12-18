import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

export default function AddonDetailModal({ addon, open, onClose, onAdd, quantity = 0, activeProfile = null }) {
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
  
  // Contextual recommendation based on selected property profile
  const isRecommendedForProfile = activeProfile && 
    bestFor.some(item => 
      item.toLowerCase().includes(activeProfile.title.toLowerCase()) ||
      item.toLowerCase().includes(activeProfile.id.replace('_', ' '))
    );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-[32px] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/95 p-1 text-primary-foreground shadow-2xl lg:flex-row animate-in fade-in zoom-in-95 duration-300">
        {/* Left side - Visual/Media */}
        <div className="rounded-[28px] bg-foreground/40 p-6 lg:w-3/5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30 shadow-inner">
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
                className="flex h-72 items-center justify-center bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/40 text-3xl font-semibold text-primary-foreground lg:h-[420px]"
                aria-label="Addon visual"
              >
                <div className="text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary-foreground/80" />
                  <p className="text-xl">{addon.name}</p>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.map((stat) => (
              <span
                key={stat}
                className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs uppercase tracking-wide text-primary-foreground/90"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>

        {/* Right side - Content */}
        <div className="rounded-[28px] bg-background text-foreground lg:w-2/5 overflow-y-auto max-h-[90vh]">
          <div className="flex flex-col gap-5 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-1">Add-on insight</p>
                <h2 className="text-2xl font-bold text-foreground">{addon.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{detail.tagline || addon.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:border-border-subtle transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contextual Recommendation Badge */}
            {isRecommendedForProfile && activeProfile && (
              <div className="rounded-xl border border-success/30 bg-success-bg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-success mb-1">
                      Recommended for your property
                    </p>
                    <p className="text-sm text-foreground">
                      This addon works well with <strong>{activeProfile.title}</strong> properties.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Decision - "Do I need this?" */}
            {detail.doINeedThis ? (
              <div className="rounded-xl border border-info/30 bg-info-bg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-info mb-2">
                      Do I need this?
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{detail.doINeedThis}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Best For & Skip If */}
            <div className="grid gap-4 text-sm">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Best for
                </p>
                <ul className="mt-2 space-y-2 text-foreground">
                  {bestFor.length > 0 ? (
                    bestFor.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-success mt-1.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1.5">✓</span>
                      <span>Any Ajax Hub 2 deployment needing flexible coverage.</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Skip if / watch-outs
                </p>
                <ul className="mt-2 space-y-2 text-foreground">
                  {avoidIf.length > 0 ? (
                    avoidIf.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-warning mt-1.5">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-warning mt-1.5">⚠</span>
                      <span>Not required for minimal-entry apartments.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* How it works */}
            {detail.howItWorks ? (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  How it works
                </p>
                <p className="text-sm text-foreground leading-relaxed">{detail.howItWorks}</p>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onAdd}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Add to quote {quantity > 0 && `(${quantity})`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
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

