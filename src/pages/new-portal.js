import Head from "next/head";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Image as ImageIcon,
  Info,
  ListChecks,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: Sparkles },
  { label: "Estimates", icon: ListChecks },
  { label: "Photos", icon: Camera },
  { label: "Payments", icon: CreditCard },
  { label: "Support", icon: MessageCircle },
];

const QUOTES = [
  {
    id: "EST-1208",
    label: "Ajax Hub Pro Kit",
    status: "Awaiting Photos",
    progress: 56,
    meta: {
      address: "2218 Royal Ln · Dallas TX",
      package: "Ajax Hub Pro - Retail Tier",
      customer: "Loft Lab · hannah@loft.com",
    },
  },
  {
    id: "EST-1209",
    label: "Paradox Edge Suite",
    status: "Ready to Approve",
    progress: 82,
    meta: {
      address: "512 King St · Seattle WA",
      package: "Paradox MG series",
      customer: "River Market · ops@rivermarket.com",
    },
  },
  {
    id: "EST-1214",
    label: "Ajax Villa Shield",
    status: "Kickoff Scheduled",
    progress: 32,
    meta: {
      address: "89 Coastal Rd · Malibu CA",
      package: "Ajax Outdoor + Smart Relays",
      customer: "Willow Estate · willow@estate.com",
    },
  },
];

const MISSION_STEPS = [
  { label: "Select Project", caption: "Choose the site you’re working on", done: true },
  { label: "Review & Adjust", caption: "Confirm devices + notes", done: true },
  { label: "Upload Photos", caption: "Snap the highlighted areas", done: false },
  { label: "Approve & Pay", caption: "Unlock once pricing updated", done: false },
  { label: "Install Day", caption: "Crew waits for your approval", done: false },
];

const PHOTO_ITEMS = [
  { label: "Lobby Hub 2", status: "Uploaded" },
  { label: "Panic Button #2", status: "Missing" },
  { label: "Hallway Sensor", status: "Missing" },
  { label: "Glass Break 1", status: "Uploaded" },
  { label: "Outdoor Siren", status: "Missing" },
];

const ACTIVITY_FEED = [
  { label: "Design desk", detail: "Validated lobby shots", time: "4 min ago" },
  { label: "Project manager", detail: "Waiting on hallway sensor photo", time: "25 min ago" },
  { label: "Accounting", detail: "Draft invoice queued", time: "2 hrs ago" },
];

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
        <div className="absolute left-1/2 top-7 z-20 w-52 -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 shadow-xl">
          {text}
        </div>
      ) : null}
    </div>
  );
}

export default function NewPortalSketch() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const activeQuote = QUOTES[quoteIndex];
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const handleSelectQuote = (index) => {
    setQuoteIndex(index);
    setMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Portal Sketch • CheapAlarms</title>
      </Head>
      <main className="min-h-screen bg-[#f7f8fd] text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,83,117,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(47,182,201,0.18),transparent_50%)]" />
        </div>
        <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-10">
          <aside className="hidden w-64 shrink-0 flex-col rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">CheapAlarms</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Customer Portal</p>
              <p className="mt-1 text-xs text-slate-500">Operations & concierge</p>
            </div>
            <nav className="mt-8 space-y-2 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Need help?</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Text Hannah, your concierge.</p>
              <p className="text-xs text-slate-500">Response under 5 mins.</p>
            </div>
          </aside>

          <section className="flex-1 space-y-6">
            {!detailMode ? (
              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">My estimates</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">Select a project</h1>
                    <p className="text-sm text-slate-500">
                      Pick an estimate to continue. We’ll remember your last viewed site for next time.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Resume last viewed</p>
                    <p className="text-sm font-semibold text-slate-900">{QUOTES[0].label}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteIndex(0);
                        setDetailMode(true);
                      }}
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
                    >
                      Resume <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {QUOTES.map((quote, index) => (
                    <div key={quote.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">#{quote.id}</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{quote.label}</p>
                        </div>
                        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          {quote.status}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{quote.meta.address}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Progress</p>
                          <p className="text-lg font-semibold text-slate-900">{quote.progress}%</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setQuoteIndex(index);
                            setDetailMode(true);
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

{detailMode ? (
<>
<header className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Estimate control center
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">{activeQuote.label}</h1>
                  <p className="text-sm text-slate-500">
                    Every quote, photo request, approval, and install milestone lives here. Switch sites
                    without leaving the portal.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right shadow-inner">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{activeQuote.status}</p>
                  <p className="text-xs text-slate-500">Progress {activeQuote.progress}%</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-white/60 p-4 shadow-inner text-sm text-slate-700 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Site address</p>
                  <p className="mt-1 font-semibold text-slate-900">{activeQuote.meta.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Base package</p>
                  <p className="mt-1 font-semibold text-slate-900">{activeQuote.meta.package}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Customer</p>
                  <p className="mt-1 font-semibold text-slate-900">{activeQuote.meta.customer}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailMode(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                >
                  Back to list
                </button>
                <div className="relative inline-block text-left">
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
                  {menuOpen ? (
                    <div className="absolute z-20 mt-3 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                      {QUOTES.map((quote, index) => (
                        <button
                          key={quote.id}
                          type="button"
                          onClick={() => handleSelectQuote(index)}
                          className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                            activeQuote.id === quote.id ? "border border-primary/30 bg-primary/5" : ""
                          }`}
                        >
                          <p className="font-semibold text-slate-900">{quote.label}</p>
                          <p className="text-xs text-slate-500">{quote.meta.address}</p>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">Currently viewing #{activeQuote.id}</p>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Photo updates</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Deployment photos</h3>
                    <p className="text-sm text-slate-500">
                      Our design desk has 3 of 5 requested angles. Please capture the remaining spots so we
                      can finalize placement.
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-4">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-6 max-h-64 space-y-3 overflow-y-auto pr-1">
                  {PHOTO_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-slate-200 p-2 text-slate-500">
                          <ImageIcon className="h-4 w-4" />
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
                <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30">
                  Launch camera
                </button>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Approval & payment</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Finalize estimate</h3>
                    <p className="text-sm text-slate-500">
                      The button unlocks once our ops team reviews your photos and refreshes pricing.
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary/15 p-4">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Estimate total</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">$7,420</p>
                    <p className="text-xs text-slate-500">Updates once photos approved</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Install window</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">Feb 12–14</p>
                    <p className="text-xs text-slate-500">Tentative until approval</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  {["Review summary", "Approve instantly", "Pay securely"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-white px-3 py-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-sm text-slate-900">{item}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 shadow-lg transition hover:-translate-y-0.5"
                >
                  Approve & Pay <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mission steps</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Operations status</h2>
                  </div>
                  <p className="text-xs text-slate-500">Auto-updates as tasks complete</p>
                </div>
                <div className="space-y-3">
                  {MISSION_STEPS.map((step) => (
                    <div
                      key={step.label}
                      className={`flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 ${
                        step.done ? "border-primary/30 bg-primary/5" : "bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.caption}</p>
                      </div>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          step.done ? "border-primary text-primary" : "border-slate-200 text-slate-400"
                        }`}
                      >
                        {step.done ? <CheckCircle className="h-4 w-4" /> : (
                          <span className="text-xs font-semibold">
                            {MISSION_STEPS.indexOf(step) + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-2">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Activity feed</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Real-time updates</h2>
                <div className="mt-4 space-y-4">
                  {ACTIVITY_FEED.map((entry) => (
                    <div key={entry.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                      <Activity className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                        <p className="text-xs text-slate-500">{entry.detail}</p>
                      </div>
                      <span className="ml-auto text-xs text-slate-400">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
) : null}
          </section>
        </div>
      </main>
    </>
  );
}

