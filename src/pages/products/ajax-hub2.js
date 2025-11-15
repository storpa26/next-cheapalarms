import dynamic from "next/dynamic";
import HeroSection from "../../components/products/ajax-landing/HeroSection";
import StoryRail from "../../components/products/ajax-landing/StoryRail";
import SquadShowcase from "../../components/products/ajax-landing/SquadShowcase";
import ResilienceSection from "../../components/products/ajax-landing/ResilienceSection";
import CtaStrip from "../../components/products/ajax-landing/CtaStrip";

const QuizSection = dynamic(
  () => import("../../components/products/ajax-landing/QuizSection"),
  {
    ssr: false,
    loading: () => (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-10 text-center shadow-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Optional quiz</p>
            <div className="mt-8 h-40 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </section>
    ),
  },
);

export default function AjaxHubLandingPage() {
  return (
    <div className="bg-slate-100 text-slate-900">
      <HeroSection />
      <StoryRail />
      <SquadShowcase />
      <ResilienceSection />
      <QuizSection />
      <CtaStrip />
    </div>
  );
}

