import Link from "next/link";

const brandTeal = "#0DC5C7";
const brandPink = "#F78AB3";

// Pre-generated star positions for consistency
const starPositions = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 0.618; // Golden ratio for distribution
  return {
    left: ((seed * 100) % 100).toFixed(2),
    top: (((seed * 1.618) * 100) % 100).toFixed(2),
    size: (2 + (seed * 2) % 2).toFixed(1),
    opacity: (0.3 + (seed * 0.5) % 0.5).toFixed(2),
    duration: (2 + (seed * 2) % 2).toFixed(1),
  };
});

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#031A27] via-[#052A3A] to-[#031A27] text-foreground min-h-screen flex items-center">
      {/* Night sky stars effect */}
      <div className="absolute inset-0 pointer-events-none">
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s infinite`,
            }}
          />
        ))}
      </div>

      {/* House silhouette with shield */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Translucent shield */}
          <div
            className="absolute inset-0 rounded-3xl border-4 opacity-20 blur-xl"
            style={{
              borderColor: brandTeal,
              boxShadow: `0 0 100px ${brandTeal}40`,
            }}
          />
          {/* House outline */}
          <div className="relative w-96 h-80">
            <div className="absolute inset-0 bg-foreground/30 rounded-3xl backdrop-blur-sm border-2 border-border/50" />
            {/* Windows with light */}
            <div className="absolute top-1/4 left-1/4 w-16 h-20 bg-yellow-400/30 rounded-lg" />
            <div className="absolute top-1/4 right-1/4 w-16 h-20 bg-yellow-400/30 rounded-lg" />
            {/* Hub glow inside */}
            <div
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${brandTeal}, ${brandTeal}80)`,
                boxShadow: `0 0 30px ${brandTeal}60`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Wolf in shadows */}
      <div className="absolute bottom-20 left-10 opacity-40">
        <div className="text-6xl" role="img" aria-label="Wolf lurking">
          🐺
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#0EF2D0] mb-6">
            <span role="img" aria-hidden>
              🐷
            </span>
            CheapAlarms presents
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Keep the wolf out.
            <br />
            Sleep like the Pig.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Ajax Hub 2 (4G) is the &quot;brain&quot; of your alarm system. It quietly connects all your sensors, sirens
            and cameras, and calls for help the instant something is wrong.
          </p>

          <div className="space-y-3 mb-10">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="text-[#0EF2D0]">✓</span>
              <span>Works even if Wi-Fi dies, thanks to 4G backup</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="text-[#0EF2D0]">✓</span>
              <span>Talks to up to 100 security devices around your home</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="text-[#0EF2D0]">✓</span>
              <span>Sends you alerts and photos in seconds</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/products/sample"
              className="rounded-full px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)` }}
            >
              Build my Ajax system
            </Link>
            <a
              href="#story"
              className="rounded-full border-2 border-foreground/30 bg-foreground/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-foreground hover:bg-foreground/20 transition-all duration-300"
            >
              How it works (2 min story)
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
