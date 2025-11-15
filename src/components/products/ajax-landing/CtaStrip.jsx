import Link from "next/link";

export default function CtaStrip() {
  return (
    <section className="bg-[#F2FCFD] py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-[32px] border border-[#CFE5EC] bg-white px-6 py-10 text-center shadow-[0_25px_60px_-40px_rgba(10,40,52,0.5)] md:flex-row md:text-left">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Next step</p>
          <h2 className="text-3xl font-semibold">Ready to build your Ajax plan?</h2>
          <p className="text-sm text-slate-600">
            Jump into the configurator or book a quick session with Percy&apos;s team. Either way,
            you&apos;ll get the same hero playbook.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap justify-center gap-3">
          <Link
            href="/products/sample"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, #0DC5C7, #07B1B3)` }}
          >
            Build my kit
          </Link>
          <Link
            href="/support"
            className="rounded-full border border-[#0DC5C7] px-6 py-3 text-sm font-semibold text-[#0B5D5F] hover:bg-[#0DC5C7]/10"
          >
            Talk to a specialist
          </Link>
        </div>
      </div>
    </section>
  );
}

