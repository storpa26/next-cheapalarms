import Link from "next/link";

const brandTeal = "#0DC5C7";
const brandPink = "#F78AB3";
const brandNavy = "#031A27";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8FDFF] text-slate-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-[#B0F7F2]/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#FFE4EE]/80 blur-[140px]" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#0EB8B9] shadow-sm">
            <span role="img" aria-hidden>
              🐷
            </span>
            CheapAlarms presents
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Percy the Pig vs. the Sneaky Wolf.
          </h1>
          <p className="text-lg text-slate-700">
            Ajax Hub 2 keeps Percy&apos;s smart home safe. Scroll to watch the wolf get trapped, meet every gadget buddy, and
            build your own kit using the exact same playbook.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#story"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Watch the chase
            </a>
            <Link
              href="/products/sample"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${brandTeal}, #06aeb0)` }}
            >
              Build my kit
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-[32px] border border-slate-200 bg-white p-1 shadow-xl">
            <div className="rounded-[30px] bg-gradient-to-b from-white to-[#E8F7F7] p-8">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <span role="img" aria-hidden>
                    🐷
                  </span>
                  Percy
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                  <span role="img" aria-hidden>
                    🐺
                  </span>
                  Wolf
                </span>
              </div>
              <div className="mt-6 h-60 rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-inner">
                <p className="text-base font-semibold text-slate-900">Hub 2 stats</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center justify-between">
                    <span>Device slots</span>
                    <span className="font-semibold text-[#0DB8BA]">200</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Power backup</span>
                    <span className="font-semibold text-[#0DB8BA]">16 hrs</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Dual uplinks</span>
                    <span className="font-semibold text-[#0DB8BA]">4G + Ethernet</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Encryption</span>
                    <span className="font-semibold text-[#0DB8BA]">AES-128</span>
                  </li>
                </ul>
                <div className="mt-6 rounded-2xl border border-slate-100 bg-[#F9FFFF] p-4 text-xs uppercase tracking-wide text-slate-500">
                  <p>Mission</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Outsmart the wolf, every time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

