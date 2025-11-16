import { useState } from "react";
import { Card } from "@/components/ui/card";
import { protectionDevices } from "../../../data/how-it-protects";

const brandTeal = "#0DC5C7";
const brandPink = "#F78AB3";

export default function HowItProtects() {
  const [activeDevice, setActiveDevice] = useState(null);

  return (
    <section className="py-20 px-4 bg-[#F5FBFD]">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">How it protects</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
            How Your Home is Protected
          </h2>
          <p className="text-xl text-center text-slate-600">
            The Hub is the brain. Everything else are its senses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive house visualization */}
          <div className="relative aspect-square bg-gradient-to-br from-[#E8F7F7]/50 to-[#F0FCFC] rounded-3xl p-8 shadow-md">
            <div className="absolute inset-8 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-[#CFE5EC] flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activeDevice ? "shadow-lg scale-105" : "shadow-md"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)`,
                    boxShadow: activeDevice
                      ? `0 0 20px ${brandTeal}40, 0 8px 16px rgba(6,174,176,0.2)`
                      : `0 4px 12px rgba(6,174,176,0.15)`,
                  }}
                >
                  <span className="text-5xl" role="img" aria-label="Ajax Hub 2">
                    🧠
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900">Ajax Hub 2</p>
                <p className="text-sm text-slate-600">The Brain</p>
              </div>
            </div>

            {/* Device hotspots */}
            {protectionDevices.map((device) => (
              <button
                key={device.id}
                type="button"
                className={`absolute ${device.position} w-12 h-12 rounded-full transition-all duration-300 hover:scale-125 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  activeDevice === device.id ? "shadow-lg scale-125" : ""
                }`}
                style={{
                  transform: "translate(-50%, -50%)",
                  background:
                    activeDevice === device.id
                      ? device.highlight
                        ? `linear-gradient(135deg, ${brandPink}, #f99bc0)`
                        : `linear-gradient(135deg, ${brandTeal}, #0ab5b6)`
                      : `linear-gradient(135deg, hsl(187 100% 42%), hsl(187 100% 35%))`,
                  boxShadow:
                    activeDevice === device.id
                      ? `0 0 20px ${device.color}50, 0 4px 12px rgba(0,0,0,0.2)`
                      : `0 2px 8px rgba(0,0,0,0.15)`,
                }}
                onMouseEnter={() => setActiveDevice(device.id)}
                onMouseLeave={() => setActiveDevice(null)}
                onClick={() => setActiveDevice(activeDevice === device.id ? null : device.id)}
                aria-label={`${device.name}: ${device.description}`}
              >
                <span className="text-2xl block text-white" role="img" aria-hidden>
                  {device.icon}
                </span>
              </button>
            ))}
          </div>

          {/* Device descriptions */}
          <div className="space-y-4">
            {protectionDevices.map((device, index) => (
              <Card
                key={device.id}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-md ${
                  activeDevice === device.id ? "border-2 shadow-lg" : "border"
                }`}
                style={{
                  borderColor: activeDevice === device.id ? device.color : undefined,
                  animationDelay: `${index * 0.1}s`,
                }}
                onMouseEnter={() => setActiveDevice(device.id)}
                onMouseLeave={() => setActiveDevice(null)}
                onClick={() => setActiveDevice(activeDevice === device.id ? null : device.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background:
                        activeDevice === device.id
                          ? device.highlight
                            ? `linear-gradient(135deg, ${brandPink}, #f99bc0)`
                            : `linear-gradient(135deg, ${brandTeal}, #0ab5b6)`
                          : `linear-gradient(135deg, hsl(187 100% 42%), hsl(187 100% 35%))`,
                    }}
                  >
                    <span className="text-2xl" role="img" aria-hidden>
                      {device.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900">{device.name}</h3>
                    <p className="text-sm text-slate-600">{device.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card className="mt-12 p-8 bg-[#F2FEFE]/50 border-none">
          <p className="text-center text-lg max-w-3xl mx-auto text-slate-700">
            All of these devices send tiny radio messages back to one place: the{" "}
            <span className="font-semibold text-[#0AA9AB]">Ajax Hub 2</span>.
            <br />
            <span className="font-semibold text-slate-900">
              The Hub listens, makes the decision, and tells everyone what to do next.
            </span>
          </p>
        </Card>
      </div>
    </section>
  );
}
