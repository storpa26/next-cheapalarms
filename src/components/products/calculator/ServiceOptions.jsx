export default function ServiceOptions({ services, onChange }) {
  const monitoringOptions = [
    { id: "off", label: "None", description: "Client self-monitors via Ajax app", price: 0 },
    { id: "standard", label: "Standard", description: "24/7 monitoring, police dispatch ready", price: 49 },
    { id: "premium", label: "Premium", description: "Monitoring + guard response coordination", price: 79 },
  ];

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Services & coverage</p>
        <h2 className="text-xl font-semibold text-foreground">Add support layers</h2>
        <p className="text-sm text-muted-foreground">
          These selections influence monthly fees and what happens after install.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium text-foreground">Monitoring tier</div>
        <div className="grid gap-3 md:grid-cols-3">
          {monitoringOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange("monitoringTier", option.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                services.monitoringTier === option.id
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60"
              }`}
            >
              <div className="text-base font-semibold">{option.label}</div>
              <p className="text-sm">{option.description}</p>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {option.price === 0 ? "Included" : "Available"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-2xl border p-4">
          <input
            type="checkbox"
            checked={services.cellularBackup}
            onChange={(event) => onChange("cellularBackup", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-border"
          />
          <div>
            <div className="text-base font-semibold text-foreground">Cellular failover</div>
            <p className="text-sm text-muted-foreground">
              Adds SIM monitoring for power or internet outages.
            </p>
          </div>
        </label>

        <label className="flex flex-col rounded-2xl border p-4">
          <span className="text-base font-semibold text-foreground">Extended warranty</span>
          <span className="text-sm text-muted-foreground">
            Add annual blocks beyond the standard 2-year Ajax warranty.
          </span>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onChange("extendedWarrantyYears", Math.max(0, services.extendedWarrantyYears - 1))
              }
              className="h-8 w-8 rounded-full border text-lg"
            >
              –
            </button>
            <div className="w-10 text-center text-sm font-semibold">{services.extendedWarrantyYears}</div>
            <button
              type="button"
              onClick={() => onChange("extendedWarrantyYears", services.extendedWarrantyYears + 1)}
              className="h-8 w-8 rounded-full border text-lg"
            >
              +
            </button>
          </div>
        </label>
      </div>
    </section>
  );
}

