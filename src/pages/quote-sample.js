import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Image as ImageIcon,
  Info,
  PhoneCall,
  Shield,
  Sparkles,
} from "lucide-react";

const sampleQuotes = [
  {
    id: "EST-1208",
    label: "Ajax Hub Pro Kit",
    status: "Awaiting Photos",
    updatedAt: "2h ago",
    progress: 56,
    highlights: ["8 devices", "Window sensors", "Panic button"],
    meta: {
      address: "2218 Royal Ln, Dallas TX",
      basePackage: "Ajax Hub Pro - Retail Tier",
      customer: "Loft Lab · hannah@loft.com",
    },
  },
  {
    id: "EST-1209",
    label: "Paradox Edge Suite",
    status: "Ready to Approve",
    updatedAt: "Yesterday",
    progress: 82,
    highlights: ["Glass break", "Pro motion", "Outdoor siren"],
    meta: {
      address: "512 King St, Seattle WA",
      basePackage: "Paradox MG series",
      customer: "River Market · ops@rivermarket.com",
    },
  },
  {
    id: "EST-1214",
    label: "Ajax Villa Shield",
    status: "Kickoff Scheduled",
    updatedAt: "Just now",
    progress: 32,
    highlights: ["Perimeter", "Smart relays", "Garage contact"],
    meta: {
      address: "89 Coastal Rd, Malibu CA",
      basePackage: "Ajax Outdoor + Smart Relays",
      customer: "Willow Estate · willow@estate.com",
    },
  },
];

const stepPrompts = {
  "Select Project": "Choose the location you want our team to focus on first.",
  "Review & Adjust": "Confirm the device list, contact details, and any special notes for this site.",
  "Upload Photos": "Send us hallway, panel, and sensor shots so our technicians can validate placement.",
  "Approve & Pay": "Once we update pricing with your photos, approve the scope and wrap up payment.",
  "Install Day": "We schedule the crew, send confirmations, and keep you posted every step of the way.",
};

const CONFETTI_DOTS = Array.from({ length: 14 }).map((_, index) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${index * 0.08}s`,
}));

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info className="h-4 w-4 text-primary" />
      {open ? (
        <div className="absolute left-1/2 top-8 z-20 w-48 -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 shadow-xl">
          {text}
        </div>
      ) : null}
    </div>
  );
}

export default function QuoteSamplePage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const activeQuote = sampleQuotes[quoteIndex];
  const [confetti, setConfetti] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const journeySteps = useMemo(
    () => [
      { label: "Select Project", done: true },
      { label: "Review & Adjust", done: activeQuote.progress > 20 },
      { label: "Upload Photos", done: activeQuote.progress > 40 },
      { label: "Approve & Pay", done: activeQuote.progress > 70 },
      { label: "Install Day", done: false },
    ],
    [activeQuote.progress]
  );
  const [selectedStep, setSelectedStep] = useState(journeySteps[0]);

  useEffect(() => {
    setSelectedStep(journeySteps[0]);
  }, [journeySteps]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 30;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 30;
    setParallax({ x: offsetX, y: offsetY });
  };

  const handleCelebrate = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1600);
  };

  const approvalReady = ["Ready to Approve", "Kickoff Scheduled"].includes(activeQuote.status);
  const approvalMessage = approvalReady
    ? "The estimate auto-updates as we validate your photos. Once ready, approving + paying is one tap."
    : "We're validating your photos now. This button unlocks once our team sends the updated price.";

  const [menuOpen, setMenuOpen] = useState(false);
  const handleSelectQuote = (index) => {
    setQuoteIndex(index);
    setMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Quote Experience • CheapAlarms</title>
      </Head>
      <main
        className="relative min-h-screen overflow-x-hidden bg-[#f7f8fd] text-slate-900"
        onMouseMove={handleMouseMove}
      >
        {confetti ? (
          <div className="pointer-events-none fixed inset-0 z-30">
            {CONFETTI_DOTS.map((dot, index) => (
              <span
                key={index}
                className={`absolute h-3 w-3 rounded-full ${
                  index % 2 === 0 ? "bg-primary/70" : "bg-secondary/70"
                } animate-ping`}
                style={{
                  left: dot.left,
                  top: dot.top,
                  animationDuration: "1.2s",
                  animationDelay: dot.delay,
                }}
              />
            ))}
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-transform duration-300"
          style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,83,117,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(47,182,201,0.18),transparent_50%)]" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <header className="mb-12 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  CheapAlarms Projects
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                  Estimate control center
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Every quote, photo request, approval, and install milestone lives here. Select the site you want to continue and we’ll keep the checklist moving.
                </p>
                <div className="mt-5 grid gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-inner text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Site address</span>
                    <span className="font-semibold text-slate-900">{activeQuote.meta.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Base package</span>
                    <span className="font-semibold text-slate-900">{activeQuote.meta.basePackage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-semibold text-slate-900">{activeQuote.meta.customer}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div
                    className="relative inline-block text-left"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
                    >
                      Switch estimate
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <p className="mt-2 text-xs text-slate-500">
                      {activeQuote.label} • tap to pick another site
                    </p>
                    {menuOpen ? (
                      <div className="absolute z-20 mt-3 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                        {sampleQuotes.map((quote, index) => (
                          <button
                            key={quote.id}
                            type="button"
                            onClick={() => handleSelectQuote(index)}
                            className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                              quoteIndex === index ? "border border-primary/30 bg-primary/5" : ""
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{quote.label}</p>
                            <p className="text-xs text-slate-500">{quote.meta.address}</p>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 text-right shadow-inner">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Currently exploring</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{activeQuote.label}</p>
                <p className="text-sm text-slate-500">{activeQuote.status}</p>
              </div>
            </div>
          </header>

          <section className="mb-10 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Checklist for {activeQuote.label}
              </h2>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Operations status
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {journeySteps.map((step, index) => (
                <div
                  key={step.label}
                  onClick={() => setSelectedStep(step)}
                  className={`cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center shadow-sm transition hover:-translate-y-0.5 ${
                    step.done ? "border-primary/30 bg-primary/5" : ""
                  } ${selectedStep.label === step.label ? "ring-2 ring-primary/40" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        step.done ? "border-primary text-primary" : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {step.done ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Step {index + 1}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{step.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Step spotlight
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedStep.label}
                  </h3>
                </div>
                <InfoTooltip text={stepPrompts[selectedStep.label]} />
              </div>
              <p className="mt-3 text-sm text-slate-500">{stepPrompts[selectedStep.label]}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["Add site notes", "Share access info", "Message project lead"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Photo updates</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Deployment photos</h3>
                  <p className="text-sm text-slate-500">
                    Our design desk has 3 of 5 requested angles. Please capture the remaining panic button and hallway sensor spots so we can finalize placement.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-6 max-h-64 space-y-3 overflow-y-auto pr-1">
                {[
                  { label: "Lobby Hub 2", status: "Uploaded", icon: <ImageIcon className="h-4 w-4" /> },
                  { label: "Panic Button #2", status: "Missing", icon: <ImageIcon className="h-4 w-4" /> },
                  { label: "Hallway Sensor", status: "Missing", icon: <ImageIcon className="h-4 w-4" /> },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-slate-200 p-2 text-slate-500">
                        {item.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <InfoTooltip text="Show us where this device will live so we can double-check angles." />
                        </div>
                        <p className="text-xs text-slate-400">Tap to capture</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Uploaded"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5">
                Launch camera
              </button>
            </div>

            <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Next actions</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Approval & payment</h3>
                  <p className="text-sm text-slate-500">{approvalMessage}</p>
                </div>
                <div className="rounded-full bg-secondary/15 p-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Estimate total</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">$7,420</p>
                  <p className="text-xs text-slate-500">Dynamic preview</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Install window</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">Feb 12 - 14</p>
                  <p className="text-xs text-slate-500">Pending approval</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {[
                  { label: "Review summary", icon: <Sparkles className="h-4 w-4" /> },
                  { label: "Approve instantly", icon: <Shield className="h-4 w-4" /> },
                  { label: "Pay securely", icon: <CreditCard className="h-4 w-4" /> },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-xl border border-white px-3 py-2 shadow-sm"
                  >
                    <span className="rounded-full border border-slate-200 p-2 text-slate-500">
                      {row.icon}
                    </span>
                    <p className="text-sm text-slate-900">{row.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 shadow-inner">
                  15s
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">How approvals work</p>
                  <p className="text-xs text-slate-500">Quick refresher on the CheapAlarms sign-off flow.</p>
                </div>
                <button className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-primary">
                  Play
                </button>
              </div>
              <button
                type="button"
                onClick={() => approvalReady && handleCelebrate()}
                disabled={!approvalReady}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] shadow-lg transition ${
                  approvalReady
                    ? "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5"
                    : "border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Approve & Pay <ArrowRight className="h-4 w-4" />
              </button>
              {!approvalReady ? (
                <p className="mt-2 text-xs text-slate-500">
                  Admin review in progress — we’ll notify you the moment this unlocks.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-full border border-slate-200 bg-gradient-to-r from-primary to-secondary px-5 py-3 text-white shadow-[0_15px_35px_rgba(201,83,117,0.35)]">
          <PhoneCall className="h-4 w-4" />
          <div>
            <p className="text-xs text-white/80">Need a human?</p>
            <p className="text-sm font-semibold text-white">Text Hannah • Concierge</p>
          </div>
        </div>
      </main>
    </>
  );
}

