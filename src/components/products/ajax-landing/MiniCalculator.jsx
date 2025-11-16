import { Card } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";

const brandTeal = "#0DC5C7";

const homeSizes = [
  { id: "apartment", label: "Apartment", icon: "🏢" },
  { id: "small", label: "Small home", icon: "🏠" },
  { id: "family", label: "Family home", icon: "🏡" },
  { id: "large", label: "Large home / business", icon: "🏛️" },
];

const recommendations = {
  apartment: {
    hub: 1,
    motion: 2,
    contacts: 2,
    outdoor: 0,
    sirens: { indoor: 1, outdoor: 0 },
    keypad: 1,
    keyfobs: 1,
  },
  small: {
    hub: 1,
    motion: 2,
    contacts: 3,
    outdoor: 0,
    sirens: { indoor: 1, outdoor: 1 },
    keypad: 1,
    keyfobs: 2,
  },
  family: {
    hub: 1,
    motion: 3,
    contacts: 4,
    outdoor: 1,
    sirens: { indoor: 1, outdoor: 1 },
    keypad: 1,
    keyfobs: 2,
  },
  large: {
    hub: 1,
    motion: 5,
    contacts: 6,
    outdoor: 2,
    sirens: { indoor: 2, outdoor: 2 },
    keypad: 2,
    keyfobs: 3,
  },
};

export default function MiniCalculator() {
  const [selectedSize, setSelectedSize] = useState("family");
  const rec = recommendations[selectedSize];

  return (
    <section className="py-20 px-4 bg-[#F5FBFD]">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Size calculator</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
            What size is your castle?
          </h2>
        </div>

        {/* Size selector */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {homeSizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSize(size.id)}
                className={`flex items-center gap-3 rounded-full px-6 py-4 text-base font-medium transition-all duration-300 ${
                  selectedSize === size.id
                    ? "bg-gradient-to-r from-[#0DC5C7] to-[#0ab5b6] text-white shadow-lg scale-105"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:border-[#0DC5C7] hover:shadow-md"
                }`}
              >
                <span className="text-2xl" role="img" aria-hidden>
                  {size.icon}
                </span>
                <span>{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended bundle */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 text-center">
              Suggested protection for a typical {homeSizes.find((s) => s.id === selectedSize)?.label.toLowerCase()}:
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    🧠
                  </span>
                  <span className="text-slate-700">
                    {rec.hub} × Ajax Hub 2 (4G)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    👁️
                  </span>
                  <span className="text-slate-700">
                    {rec.motion} × indoor motion &quot;eyes&quot;
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    🚪
                  </span>
                  <span className="text-slate-700">
                    {rec.contacts} × door / window contacts
                  </span>
                </div>
                {rec.outdoor > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden>
                      🔍
                    </span>
                    <span className="text-slate-700">
                      {rec.outdoor} × outside motion detector
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    📢
                  </span>
                  <span className="text-slate-700">
                    {rec.sirens.indoor} × indoor siren, {rec.sirens.outdoor} × outdoor siren
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    📱
                  </span>
                  <span className="text-slate-700">
                    {rec.keypad} × keypad, {rec.keyfobs} × keyfobs
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-[#F2FEFE] border-l-4" style={{ borderLeftColor: brandTeal }}>
                <h4 className="font-semibold mb-2 text-slate-900">Good</h4>
                <p className="text-sm text-slate-600">Stops the Wolf at the doors.</p>
              </Card>
              <Card className="p-4 bg-[#F2FEFE] border-l-4" style={{ borderLeftColor: brandTeal }}>
                <h4 className="font-semibold mb-2 text-slate-900">Better</h4>
                <p className="text-sm text-slate-600">Add cameras for extra proof.</p>
              </Card>
              <Card className="p-4 bg-[#F2FEFE] border-l-4" style={{ borderLeftColor: brandTeal }}>
                <h4 className="font-semibold mb-2 text-slate-900">Best</h4>
                <p className="text-sm text-slate-600">
                  Add fire and leak sensors so your home is protected from more than just intruders.
                </p>
              </Card>
            </div>

            <div className="text-center">
              <Link
                href="/products/sample"
                className="inline-block rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)` }}
              >
                Get this designed properly
              </Link>
              <p className="mt-4 text-sm text-slate-600">
                We design and install Ajax systems across Australia. Tell us about your place and we&apos;ll do the
                thinking for you.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

