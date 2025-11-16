import dynamic from "next/dynamic";
import HeroSection from "../../components/products/ajax-landing/HeroSection";
import MeetTheCast from "../../components/products/ajax-landing/MeetTheCast";
import HowItProtects from "../../components/products/ajax-landing/HowItProtects";
import StoryRail from "../../components/products/ajax-landing/StoryRail";
import ResilienceSection from "../../components/products/ajax-landing/ResilienceSection";
import CapacitySection from "../../components/products/ajax-landing/CapacitySection";
import KitSection from "../../components/products/ajax-landing/KitSection";
import MiniCalculator from "../../components/products/ajax-landing/MiniCalculator";
import FaqSection from "../../components/products/ajax-landing/FaqSection";
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
      <MeetTheCast />
      <HowItProtects />
      <StoryRail />
      <ResilienceSection />
      <CapacitySection />
      <KitSection />
      <MiniCalculator />
      <FaqSection />
      <CtaStrip />
    </div>
  );
}

