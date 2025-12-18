import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Home, CheckCircle2, Info, Sparkles, Building2, Store, Warehouse } from "lucide-react";

const profileIcons = {
  standard_home: Home,
  larger_home: Building2,
  small_retail: Store,
  warehouse: Warehouse,
};

export default function PropertyProfileModal({ profile, open, onClose, onSelect }) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !profile) return null;

  const Icon = profileIcons[profile.id] || Home;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative z-10 mx-auto w-full max-w-4xl rounded-[32px] bg-background p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-[28px] bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-1">Property Profile</p>
                <h2 className="text-3xl font-bold text-foreground">{profile.title}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:border-border-subtle transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scope Guide */}
          <div className="rounded-xl border border-info/30 bg-info-bg p-5 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-info mb-2">What this profile includes</p>
                <p className="text-base text-foreground leading-relaxed">{profile.scopeGuide}</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Key Features
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {profile.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage Defaults */}
          {profile.coverageDefaults && (
            <div className="rounded-xl border border-border bg-muted/30 p-5 mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Default Coverage Settings
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(profile.coverageDefaults).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-2xl font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                These defaults are pre-filled but can be adjusted in the coverage planner
              </p>
            </div>
          )}

          {/* When to use */}
          <div className="rounded-xl border border-success/30 bg-success-bg/50 p-5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-success mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              When to use this profile
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              This profile is ideal if your property matches the description above. It provides a good starting point
              for typical installations of this type. You can always customize the coverage settings to match your
              specific needs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                onSelect?.(profile.id);
                onClose();
              }}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Use This Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

