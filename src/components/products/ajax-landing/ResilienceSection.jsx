const cards = [
  {
    title: "Two lifelines",
    desc: "Ethernet + 4G SIM report at the same time. If one nods off, the other yells.",
    icon: "📡",
  },
  {
    title: "Power backup",
    desc: "Built-in battery keeps the hub alive up to 16 hours during outages.",
    icon: "🔋",
  },
  {
    title: "Encrypted chatter",
    desc: "Signals are wrapped in AES-128 encryption so neighbors can’t spoof devices.",
    icon: "🔐",
  },
];

export default function ResilienceSection() {
  return (
    <section className="bg-muted py-20 text-foreground">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Always on</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Redundancy is Percy&apos;s secret weapon.</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Hub 2 keeps sending alerts no matter what the wolf does to wires or Wi‑Fi.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-border bg-background p-6 shadow-lg"
            >
              <div className="mb-4 text-3xl">{card.icon}</div>
              <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

