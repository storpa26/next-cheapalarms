import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { addonCatalog } from "../../../data/ajax-hub2";

const friendlyNames = {
  door_contact: "Door Buddy",
  motion_indoor: "Motion Scout",
  glass_break: "Glass Listener",
  motion_outdoor: "Yard Watcher",
  panic_button: "Panic Pebble",
  keypad: "Voice Pad",
  touchscreen: "Touchscreen Pad",
  indoor_siren: "Boom Siren",
  outdoor_siren: "Street Siren",
  relay: "Magic Switch",
};

const brandTeal = "#0DC5C7";

const circleColors = [
  "#E4F8F8",
  "#FFF1F7",
  "#E6F3FF",
  "#ECFDF5",
  "#F3F1FF",
  "#E4F8F8",
  "#FFF1F7",
  "#E6F3FF",
  "#ECFDF5",
];

const brandPink = "#F78AB3";

export default function SquadShowcase() {
  const [active, setActive] = useState(addonCatalog[0]?.id ?? null);
  const [hovered, setHovered] = useState(null);

  const activeAddon = addonCatalog.find((addon) => addon.id === active) ?? addonCatalog[0];

  return (
    <section className="bg-muted py-20 text-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Meet the squad</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Tap a device pod to see why Percy trusts it.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Each circle is a gadget. The wolf hates them, Percy loves them. Pick one to hear why.
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addonCatalog.slice(0, 9).map((addon, idx) => {
              const isActive = active === addon.id;
              const isHovered = hovered === addon.id;
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => setActive(addon.id)}
                  onMouseEnter={() => setHovered(addon.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative h-44 w-44 overflow-hidden rounded-full border border-[#CFE5EC] p-1 transition hover:border-[#0DC5C7]"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${circleColors[idx]}, #FFFFFF 80%)`,
                    boxShadow: isActive ? "0 15px 45px rgba(6, 174, 176, 0.25)" : "0 8px 20px rgba(15, 42, 56, 0.1)",
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-background/80">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-foreground/20 shadow-inner">
                      <Image
                        src={`https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=200&q=60&sig=${idx}`}
                        alt={addon.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      {friendlyNames[addon.id] ?? addon.name}
                    </p>
                    <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#0AA9AB]">
                      Tap to learn
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent transition"
                    style={{
                      borderColor: isActive ? "#0EF2D0" : "transparent",
                      boxShadow: isHovered ? "0 0 15px rgba(247,138,179,0.4)" : undefined,
                    }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border bg-background p-6 shadow-lg">
            {activeAddon ? (
              <>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#0AA9AB]">
                  <span>{activeAddon.category}</span>
                  <span>${activeAddon.priceExGst.toFixed(0)} ex GST</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">
                  {friendlyNames[activeAddon.id] ?? activeAddon.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeAddon.details?.tagline || activeAddon.description}
                </p>
                <div className="mt-4 grid gap-4 text-sm">
                  {activeAddon.details?.doINeedThis ? (
                    <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
                      <p className="text-xs uppercase tracking-wide text-[#0AA9AB]">Why Percy adds it</p>
                      <p className="mt-1">{activeAddon.details.doINeedThis}</p>
                    </div>
                  ) : null}
                  {activeAddon.details?.bestFor ? (
                    <div className="rounded-2xl bg-muted/50 p-4 text-muted-foreground">
                      <p className="text-xs uppercase tracking-wide text-[#0AA9AB]">Perfect when</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {activeAddon.details.bestFor.slice(0, 3).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                <Link
                  href="/products/sample"
                  className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)` }}
                >
                  Add to my kit
                </Link>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <span className="text-4xl" role="img" aria-hidden>
                  🐷
                </span>
                <p className="mt-3 text-base font-semibold text-foreground">Tap a pod to see its story.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

