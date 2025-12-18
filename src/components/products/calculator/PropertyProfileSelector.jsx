import { Fragment } from "react";
import { Info, CheckCircle2 } from "lucide-react";

export default function PropertyProfileSelector({
  profiles,
  activeId,
  onSelect,
  propertyFlags,
  onToggleFlag,
  onShowDetails,
}) {
  const flagConfigs = [
    { id: "hasPets", label: "Pet friendly zones" },
    { id: "needsInsuranceGrade", label: "Insurance certificate required" },
    { id: "needsFourG", label: "Must include 4G backup" },
  ];

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Scope setup</p>
          <h2 className="text-xl font-semibold text-foreground">Choose a property profile</h2>
          <p className="text-sm text-muted-foreground">
            Each profile includes a typical site guide plus defaults for coverage inputs.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {profiles.map((profile) => {
          const isActive = profile.id === activeId;
          return (
            <div
              key={profile.id}
              className={`rounded-2xl border p-5 transition ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs uppercase text-muted-foreground">Typical site profile</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{profile.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{profile.scopeGuide}</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {profile.highlights.slice(0, 2).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {isActive && (
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(profile.id)}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {isActive ? "Selected" : "Select"}
                </button>
                <button
                  type="button"
                  onClick={() => onShowDetails?.(profile.id)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  Learn more
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {flagConfigs.map((flag) => (
          <Fragment key={flag.id}>
            <button
              type="button"
              onClick={() => onToggleFlag(flag.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                propertyFlags[flag.id]
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60"
              }`}
              aria-pressed={propertyFlags[flag.id]}
            >
              {flag.label}
            </button>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

