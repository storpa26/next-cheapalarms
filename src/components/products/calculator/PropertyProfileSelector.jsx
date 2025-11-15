import { Fragment } from "react";

export default function PropertyProfileSelector({
  profiles,
  activeId,
  onSelect,
  propertyFlags,
  onToggleFlag,
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
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/60"
              }`}
            >
              <div className="text-xs uppercase text-muted-foreground">Typical site profile</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{profile.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{profile.scopeGuide}</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {profile.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </button>
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

