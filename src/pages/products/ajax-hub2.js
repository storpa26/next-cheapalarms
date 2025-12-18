import dynamic from "next/dynamic";
// Above-the-fold: Load immediately
import HeroSection from "../../components/products/ajax-landing/HeroSection";
import MeetTheCast from "../../components/products/ajax-landing/MeetTheCast";
import HowItProtects from "../../components/products/ajax-landing/HowItProtects";

// Below-the-fold: Lazy load for better initial page performance
const StoryRail = dynamic(() => import("../../components/products/ajax-landing/StoryRail"), {
  loading: () => <div className="min-h-[400px]" />,
});
const ResilienceSection = dynamic(() => import("../../components/products/ajax-landing/ResilienceSection"), {
  loading: () => <div className="min-h-[300px]" />,
});
const CapacitySection = dynamic(() => import("../../components/products/ajax-landing/CapacitySection"), {
  loading: () => <div className="min-h-[400px]" />,
});
const KitSection = dynamic(() => import("../../components/products/ajax-landing/KitSection"), {
  loading: () => <div className="min-h-[400px]" />,
});
const MiniCalculator = dynamic(() => import("../../components/products/ajax-landing/MiniCalculator"), {
  loading: () => <div className="min-h-[500px]" />,
});
const FaqSection = dynamic(() => import("../../components/products/ajax-landing/FaqSection"), {
  loading: () => <div className="min-h-[400px]" />,
});
const CtaStrip = dynamic(() => import("../../components/products/ajax-landing/CtaStrip"), {
  loading: () => <div className="min-h-[200px]" />,
});

const QuizSection = dynamic(
  () => import("../../components/products/ajax-landing/QuizSection"),
  {
    ssr: false,
    loading: () => (
      <section className="bg-background py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-[32px] border border-border bg-muted p-10 text-center shadow-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Optional quiz</p>
            <div className="mt-8 h-40 animate-pulse rounded-3xl bg-background" />
          </div>
        </div>
      </section>
    ),
  },
);

export default function AjaxHubLandingPage() {
  return (
    <div className="bg-muted text-foreground">
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

