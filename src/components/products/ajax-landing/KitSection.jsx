import { Card } from "@/components/ui/card";

const brandTeal = "#0DC5C7";

export default function KitSection() {
  const kitItems = [
    {
      icon: "🧠",
      title: "The Brain (Ajax Hub 2 4G)",
      description: "Sits hidden. Connects to power, internet and SIM. Runs the whole system.",
    },
    {
      icon: "👁️",
      title: 'Indoor "eyes" (motion detectors)',
      description: "Watch hallways and rooms when no one should be home.",
    },
    {
      icon: "🚪",
      title: 'Door and window "ears" (contacts)',
      description: "Notice when perimeters are opened.",
    },
    {
      icon: "📢",
      title: 'Loud mouths (sirens)',
      description: "Scare off intruders and wake people up.",
    },
    {
      icon: "📱",
      title: "Control (keypads, keyfobs, phone app)",
      description: "Arm, disarm, see events, get photos, control automation.",
    },
    {
      icon: "➕",
      title: "Optional extras",
      description: "Smart switches, leak sensors, smoke alarms and more can all be added later.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">What you get</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
            What do I actually get?
          </h2>
          <p className="text-xl text-center text-slate-600">
            The real hardware that keeps the wolf out.
          </p>
        </div>

        {/* Starter kit visual placeholder */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-2">Starter kit photo</p>
              <p className="text-slate-400 text-xs">
                Hub, 2× PIRs, door contact, keypad, internal siren, external siren, keyfob
              </p>
            </div>
          </div>
        </div>

        {/* Kit breakdown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {kitItems.map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandTeal}20, ${brandTeal}10)`,
                  }}
                >
                  <span role="img" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

