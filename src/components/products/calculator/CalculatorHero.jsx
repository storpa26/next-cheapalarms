export default function CalculatorHero() {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary">Ajax Hub 2 • 4G</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Build your Ajax Hub 2 package
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Mix and match sensors, sirens, and services. The right rail keeps a running tally so you
            always know budget, install time, and system limits before requesting your quote.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            "Cellular + Ethernet redundancy",
            "Up to 200 devices",
            "Pet-friendly options",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-dashed border-primary/40 px-4 py-2 text-sm text-primary"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

