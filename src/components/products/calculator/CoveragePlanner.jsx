export default function CoveragePlanner({
  coverage,
  onChange,
  onRecommend,
  presets,
  onApplyPreset,
}) {
  const inputs = [
    { id: "doors", label: "Doorways", hint: "External and internal arming points" },
    { id: "windows", label: "Windows", hint: "Windows that should alarm when opened" },
    { id: "glassWalls", label: "Glass walls / shopfronts", hint: "Meters of continuous glass" },
    { id: "outdoorZones", label: "Outdoor zones", hint: "Driveways, yards, or gates" },
    { id: "panicButtons", label: "Panic buttons", hint: "Duress buttons or fobs" },
  ];

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Coverage planner</p>
          <h2 className="text-xl font-semibold text-foreground">Map the areas you need to protect</h2>
          <p className="text-sm text-muted-foreground">
            These numbers fuel the recommendations engine so the add-on list stays realistic.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {inputs.map((input) => (
          <label key={input.id} className="flex flex-col rounded-xl border p-4">
            <span className="text-sm font-medium text-foreground">{input.label}</span>
            <span className="text-xs text-muted-foreground">{input.hint}</span>
            <input
              type="number"
              min={0}
              value={coverage[input.id]}
              onChange={(event) => onChange(input.id, Number(event.target.value))}
              className="mt-3 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Recommendation engine suggests sensors based on door, window, and specialty counts.
        </p>
        <button
          type="button"
          onClick={onRecommend}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Apply recommended sensors
        </button>
      </div>
    </section>
  );
}

