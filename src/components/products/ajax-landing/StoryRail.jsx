import { useEffect, useRef, useState } from "react";

const steps = [
  {
    title: "Wolf creeps in",
    desc: "Door Buddy spots the wolf cracking open the door.",
    emoji: "🐺",
    desktop: { top: 30, align: "left" },
  },
  {
    title: "Hub 2 wakes up",
    desc: "Brain double-checks other sensors to avoid false alarms.",
    emoji: "🧠",
    desktop: { top: 30, align: "right" },
  },
  {
    title: "Squad responds",
    desc: "Sirens blast, lights flash, and the wolf panics.",
    emoji: "🚨",
    desktop: { top: 190, align: "left" },
  },
  {
    title: "Piggy gets pinged",
    desc: "App + monitoring message Percy the Pig instantly.",
    emoji: "🐷",
    desktop: { top: 340, align: "right" },
  },
];

const brandDark = "#FFFFFF";
const brandTeal = "#0DC5C7";

export default function StoryRail() {
  const cardRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const runnerPositions = steps.map((step) => {
    if (step.desktop.align === "left") {
      return { top: step.desktop.top + 30, left: 10 };
    }
    return { top: step.desktop.top + 30, left: 90 };
  });
  const currentRunnerPos = runnerPositions[activeStep] ?? runnerPositions[0];

  const desktopView = (
    <div className="relative hidden h-[430px] md:block">
      {[60, 220, 370].map((top) => (
        <div
          key={top}
          className="absolute left-[6%] right-[6%] h-1 rounded-full border-t-4 border-dashed opacity-40"
          style={{ top: `${top}px`, borderColor: brandTeal }}
        />
      ))}
      <div
        className="absolute text-4xl transition-all duration-700 ease-out"
        role="img"
        aria-label="wolf running"
        style={{
          top: `${currentRunnerPos.top}px`,
          left: `${currentRunnerPos.left}%`,
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
        }}
      >
        🐺
      </div>
      <div
        className="absolute text-4xl"
        role="img"
        aria-label="pig cheering"
        style={{
          bottom: 10,
          right: "4%",
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
        }}
      >
        🐷
      </div>
      {steps.map((step, index) => {
        const alignRight = step.desktop.align === "right";
        return (
          <div
            key={step.title}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="absolute w-[38%] rounded-3xl border p-6 text-left shadow-lg transition"
            style={{
              top: `${step.desktop.top}px`,
              left: alignRight ? "auto" : "6%",
              right: alignRight ? "6%" : "auto",
              backgroundColor: activeStep === index ? "#E8FBFB" : "#FFFFFF",
              borderColor: activeStep === index ? brandTeal : "#E2EBEE",
            }}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#0AA9AB]">
              <span>Step {index + 1}</span>
              <span>{step.emoji}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
            <div
              className="absolute -bottom-5 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: brandTeal, opacity: activeStep === index ? 1 : 0.3 }}
            />
          </div>
        );
      })}
    </div>
  );

  const mobileView = (
    <div className="grid gap-6 md:hidden">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="rounded-3xl border border-[#E2EBEE] bg-white p-6 text-left shadow-lg"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#0AA9AB]">
            <span>Step {index + 1}</span>
            <span>{step.emoji}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
        </div>
      ))}
    </div>
  );

  return (
    <section id="story" className="bg-[#F4FBFD] py-20 text-slate-900">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-[#0AA9AB]">Break-in story</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Watch the wolf get caught.</h2>
          <p className="mt-3 text-base text-slate-600">
            Scroll to follow the zig-zag chase. Percy set teal traps on every corner—see them glow as the wolf hits each step.
          </p>
        </div>
        <div
          className="mt-14 rounded-[38px] border bg-white p-6 shadow-[0_20px_70px_-40px_rgba(5,46,58,0.4)]"
          style={{
            borderColor: `${brandTeal}30`,
          }}
        >
          {desktopView}
          {mobileView}
        </div>
      </div>
    </section>
  );
}

