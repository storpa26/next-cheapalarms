function QuantityStepper({ value, onChange, max }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-8 w-8 rounded-full border text-lg leading-none text-muted-foreground hover:border-primary"
      >
        –
      </button>
      <div className="w-10 text-center text-sm font-semibold">{value}</div>
      <button
        type="button"
        onClick={() => onChange(Math.min((max ?? 99), value + 1))}
        className="h-8 w-8 rounded-full border text-lg leading-none text-muted-foreground hover:border-primary"
      >
        +
      </button>
    </div>
  );
}

export default function AddonsGrid({ catalog, quantities, onQuantityChange, onShowDetails }) {
  const categories = Array.from(new Set(catalog.map((item) => item.category)));

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Sensors & devices</p>
        <h2 className="text-xl font-semibold text-foreground">Add hardware to the kit</h2>
        <p className="text-sm text-muted-foreground">
          Each card shows install minutes and system limits so you can stay within Hub 2 capacity.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mt-6">
          <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {category}
          </div>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {catalog
              .filter((item) => item.category === category)
              .map((item) => {
                const qty = quantities[item.id] ?? 0;
                const max = item.maxPerSystem;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border p-4 transition hover:border-primary/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-foreground">{item.name}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <QuantityStepper value={qty} onChange={(value) => onQuantityChange(item.id, value)} max={max} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        {item.installMinutes} min install
                      </span>
                      {max ? <span>Max {max} per system</span> : null}
                      {item.powerDrawMa ? <span>{item.powerDrawMa} mA draw</span> : null}
                      <button
                        type="button"
                        onClick={() => onShowDetails?.(item.id)}
                        className="ml-auto text-primary underline-offset-4 hover:underline"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </section>
  );
}

