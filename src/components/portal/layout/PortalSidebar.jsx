import { useState } from "react";
import { Sparkles, ListChecks, CreditCard, MessageCircle, Settings, Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";

const NAV_ITEMS = [
  { label: "Overview", icon: Sparkles, id: "overview" },
  { label: "Estimates", icon: ListChecks, id: "estimates" },
  { label: "Payments", icon: CreditCard, id: "payments" },
  { label: "Support", icon: MessageCircle, id: "support" },
  { label: "Preferences", icon: Settings, id: "preferences" },
];

export function PortalSidebar({ activeNav, onNavChange, estimateId, onBackToList }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (itemId) => {
    onNavChange(itemId);
    if (itemId === "estimates" && estimateId) {
      onBackToList();
    }
    // Close mobile menu after navigation
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-4 z-50 rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl lg:hidden"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-slate-900" />
        ) : (
          <Menu className="h-6 w-6 text-slate-900" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 shrink-0 flex-col rounded-r-3xl border-r border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 lg:rounded-3xl lg:border ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">CheapAlarms</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Customer Portal</p>
          <p className="mt-1 text-xs text-slate-500">Operations & concierge</p>
        </div>
        <nav className="mt-8 space-y-2 text-sm font-medium">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition active:scale-95 ${
              activeNav === item.id
                ? "border-primary/30 bg-primary/5 text-slate-900"
                : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
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
        <div className="mt-4 flex items-center justify-between">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}

