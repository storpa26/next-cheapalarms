import Link from "next/link";

const brandTeal = "#0DC5C7";

export default function CtaStrip() {
  return (
    <section className="bg-gradient-to-br from-[#F2FCFD] to-[#E8F7F7] py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-5xl" role="img" aria-hidden>
              🐷
            </span>
            <span className="text-5xl" role="img" aria-hidden>
              🧠
            </span>
            <span className="text-5xl opacity-50" role="img" aria-hidden>
              🐺
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Let the Hub stay up late so you don&apos;t have to.
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Tell us about your home and we&apos;ll design an Ajax Hub 2 system that keeps the Wolf out and your Pig
            brain in rest mode.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/products/sample"
            className="rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${brandTeal}, #0ab5b6)` }}
          >
            Talk to a security designer
          </Link>
          <Link
            href="/products/sample"
            className="rounded-full border-2 border-[#0DC5C7] px-8 py-4 text-base font-semibold text-[#0B5D5F] hover:bg-[#0DC5C7]/10 transition-all duration-300"
          >
            See Ajax bundles
          </Link>
        </div>
      </div>
    </section>
  );
}
