import { Card } from "@/components/ui/card";
import { useState } from "react";

const brandTeal = "#0DC5C7";

export default function CapacitySection() {
  const [hoveredDevice, setHoveredDevice] = useState(null);

  // Create 100 device bubbles in a ring
  const deviceBubbles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    angle: (i / 100) * 360,
    radius: 180,
  }));

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Capacity</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            One Hub. A whole house full of protection.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual capacity ring */}
          <div className="relative aspect-square max-w-lg mx-auto">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Hub in center */}
              <div
                className="absolute z-10 w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)`,
                  boxShadow: `0 0 30px ${brandTeal}40`,
                }}
              >
                <span className="text-5xl" role="img" aria-label="Ajax Hub 2">
                  🧠
                </span>
              </div>

              {/* Device bubbles ring */}
              <div className="absolute inset-0">
                {deviceBubbles.map((bubble) => {
                  const x = 50 + (bubble.radius / 200) * 50 * Math.cos((bubble.angle * Math.PI) / 180);
                  const y = 50 + (bubble.radius / 200) * 50 * Math.sin((bubble.angle * Math.PI) / 180);

                  return (
                    <div
                      key={bubble.id}
                      className="absolute w-3 h-3 rounded-full transition-all duration-300"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%)",
                        background: hoveredDevice === bubble.id ? brandTeal : `${brandTeal}30`,
                        boxShadow: hoveredDevice === bubble.id ? `0 0 8px ${brandTeal}` : "none",
                      }}
                      onMouseEnter={() => setHoveredDevice(bubble.id)}
                      onMouseLeave={() => setHoveredDevice(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Capacity details */}
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground mb-6">
              Ajax Hub 2 can be the brain for:
            </p>

            <div className="space-y-4">
              <Card className="p-6 border-l-4" style={{ borderLeftColor: brandTeal }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-hidden>
                    📡
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      Up to <span className="text-[#0AA9AB]">100</span> security devices
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sensors, sirens, keypads, relays—all talking to one Hub.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4" style={{ borderLeftColor: brandTeal }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-hidden>
                    📢
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      Up to <span className="text-[#0AA9AB]">10</span> sirens or keypads
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      With built-in buzzers for alerts throughout your home.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4" style={{ borderLeftColor: brandTeal }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-hidden>
                    📶
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      Up to <span className="text-[#0AA9AB]">5</span> range extenders
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      To reach big homes and outbuildings.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4" style={{ borderLeftColor: brandTeal }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-hidden>
                    📹
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      Up to <span className="text-[#0AA9AB]">25</span> IP cameras / recorders
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For live view and recording.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="mt-8 p-6 bg-gradient-to-br from-muted to-muted/80 border-none">
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">In normal English:</span>
                <br />
                One Hub can easily look after a whole home, town house or small business, with plenty of room to grow.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

