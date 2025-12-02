import { SupportSection } from "../sections/SupportSection";
import { FAQSection } from "../sections/AccountSection";
import { mockSupportInfo } from "../utils/mock-data";

export function SupportView({ view }) {
  // Use actual data if available, otherwise use mock data
  const support = view?.support || mockSupportInfo();

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Customer care</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Support & Help</h1>
        <p className="mt-1 text-sm text-slate-500">
          Get in touch with your dedicated specialist or browse our FAQ.
        </p>
      </div>

      <SupportSection support={support} />
      <FAQSection />
    </div>
  );
}

