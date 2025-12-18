import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { User, Mail, Phone, CheckCircle2, AlertCircle, Sparkles, FileText, ArrowLeft } from "lucide-react";
import CalculatorHero from "../../components/products/calculator/CalculatorHero";
import PropertyProfileSelector from "../../components/products/calculator/PropertyProfileSelector";
import CoveragePlanner from "../../components/products/calculator/CoveragePlanner";
import AddonsGrid from "../../components/products/calculator/AddonsGrid";
import ServiceOptions from "../../components/products/calculator/ServiceOptions";
import SummaryPanel from "../../components/products/calculator/SummaryPanel";
import AddonDetailModal from "../../components/products/calculator/AddonDetailModal";
import PropertyProfileModal from "../../components/products/calculator/PropertyProfileModal";
import QuoteWizardProgress from "../../components/products/calculator/QuoteWizardProgress";
import ConfigurationSummaryCard from "../../components/products/calculator/ConfigurationSummaryCard";
import TransitionOverlay from "../../components/products/calculator/TransitionOverlay";
import { LoginModal } from "../../components/ui/login-modal";
import { useAjaxCalculator } from "../../hooks/useAjaxCalculator";

function extractContactId(result) {
  if (!result) return null;
  const candidate =
    result.contact?.contact?.id ??
    result.contact?.id ??
    result.contactId ??
    result.id ??
    result?.data?.id ??
    null;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

export default function SampleProductPage() {
  const {
    baseKit,
    addonCatalog,
    propertyProfiles,
    profileId,
    setProfileId,
    propertyFlags,
    toggleFlag,
    coverage,
    setCoverageField,
    addonQuantities,
    setAddonQuantity,
    selectedAddons,
    totals,
    limitUsage,
    services,
    updateService,
    applyRecommendations,
    presets,
    applyPreset,
  } = useAjaxCalculator();

  const [currentStep, setCurrentStep] = useState(1); // 1 = Configuration, 2 = Contact Form
  const [inCart, setInCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [configSnapshot, setConfigSnapshot] = useState(null);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [estimateId, setEstimateId] = useState(null);
  const [locationId, setLocationId] = useState(null);

  const router = useRouter();
  const [detailAddonId, setDetailAddonId] = useState(null);
  const [detailProfileId, setDetailProfileId] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const activeProfile = useMemo(
    () => propertyProfiles.find((profile) => profile.id === profileId),
    [propertyProfiles, profileId],
  );
  const detailAddon = useMemo(
    () => addonCatalog.find((addon) => addon.id === detailAddonId),
    [addonCatalog, detailAddonId],
  );

  // Configuration change detection
  const hasConfigChanged = useMemo(() => {
    if (!configSnapshot || !inCart) return false;
    
    // Compare profile
    if (configSnapshot.profileId !== profileId) return true;
    
    // Compare property flags
    const flagsChanged = Object.keys(propertyFlags).some(
      (key) => configSnapshot.propertyFlags[key] !== propertyFlags[key]
    );
    if (flagsChanged) return true;
    
    // Compare coverage
    const coverageChanged = Object.keys(coverage).some(
      (key) => configSnapshot.coverage[key] !== coverage[key]
    );
    if (coverageChanged) return true;
    
    // Compare addon quantities
    const addonKeys = new Set([
      ...Object.keys(configSnapshot.addonQuantities),
      ...Object.keys(addonQuantities),
    ]);
    for (const key of addonKeys) {
      if ((configSnapshot.addonQuantities[key] || 0) !== (addonQuantities[key] || 0)) {
        return true;
      }
    }
    
    // Compare services
    const servicesChanged = Object.keys(services).some(
      (key) => configSnapshot.services[key] !== services[key]
    );
    if (servicesChanged) return true;
    
    return false;
  }, [configSnapshot, inCart, profileId, propertyFlags, coverage, addonQuantities, services]);

  // Save configuration snapshot
  const saveConfigSnapshot = () => {
    setConfigSnapshot({
      profileId,
      propertyFlags: { ...propertyFlags },
      coverage: { ...coverage },
      addonQuantities: { ...addonQuantities },
      services: { ...services },
    });
  };

  function handleAddToCart() {
    // If updating, reset inCart first
    if (inCart && hasConfigChanged) {
      setInCart(false);
    }
    
    // Scroll to top immediately (before transition)
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Start transition
    setIsTransitioning(true);
    setTransitionProgress(0);
    
    // Animate progress bar
    const startTime = Date.now();
    const duration = 600; // 600ms transition
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      
      setTransitionProgress(progress);
      
      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Transition complete
        setIsTransitioning(false);
        setInCart(true);
        setCurrentStep(2);
        saveConfigSnapshot();
        
        // Ensure we're at the top after transition
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    
    requestAnimationFrame(animate);
  }

  function handleStepNavigation(step) {
    if (step === 1) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && inCart) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBackToConfiguration() {
    setCurrentStep(1);
  }

  async function handleSubmitQuote(e) {
    e.preventDefault();

    // Validate required fields
    if (!email) {
      setSubmitError("Email is required");
      return;
    }

    if (!inCart) {
      setSubmitError("Please add configuration to cart first");
      return;
    }

    setSubmitError("");
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      // Build line items from calculator data
      const items = [];

      // Add base kit
      if (baseKit && baseKit.priceExGst) {
        items.push({
          name: baseKit.name,
          description: baseKit.summary?.join(", ") || baseKit.name,
          amount: baseKit.priceExGst,
          qty: 1,
        });
      }

      // Add addons
      selectedAddons.forEach((addon) => {
        if (addon.priceExGst && addon.quantity > 0) {
          items.push({
            name: addon.name,
            description: addon.description || addon.name,
            amount: addon.priceExGst,
            qty: addon.quantity,
          });
        }
      });

      // Add services
      // services is an object: { monitoringTier, cellularBackup, extendedWarrantyYears }
      if (services.monitoringTier && services.monitoringTier !== "off") {
        const monitoringPrice = {
          standard: 49,
          premium: 79,
        }[services.monitoringTier] || 0;
        if (monitoringPrice > 0) {
          items.push({
            name: `Monitoring - ${services.monitoringTier.charAt(0).toUpperCase() + services.monitoringTier.slice(1)}`,
            description: `Monthly monitoring service (${services.monitoringTier} tier)`,
            amount: monitoringPrice,
            qty: 1,
            currency: "AUD",
            type: "recurring",
            taxInclusive: true,
          });
        }
      }

      if (services.cellularBackup) {
        items.push({
          name: "Cellular Backup",
          description: "Cellular backup service",
          amount: 18,
          qty: 1,
          currency: "AUD",
          type: "recurring",
          taxInclusive: true,
        });
      }

      if (services.extendedWarrantyYears > 0) {
        items.push({
          name: `Extended Warranty - ${services.extendedWarrantyYears} ${services.extendedWarrantyYears === 1 ? "Year" : "Years"}`,
          description: `Extended warranty coverage`,
          amount: 89 * services.extendedWarrantyYears,
          qty: 1,
          currency: "AUD",
          type: "one_time",
          taxInclusive: true,
        });
      }
      
      // Ensure all items have required GHL fields
      items.forEach(item => {
        if (!item.currency) item.currency = "AUD";
        if (!item.type) item.type = "one_time";
        if (item.taxInclusive === undefined) item.taxInclusive = true;
      });

      // Submit quote request (creates contact, estimate, and portal invitation)
      const quotePayload = {
        firstName,
        lastName,
        email,
        phone,
        items,
        propertyProfile: activeProfile?.title || "Custom",
        locationId: process.env.NEXT_PUBLIC_GHL_LOCATION_ID || null,
      };

      let quoteRes;
      try {
        quoteRes = await fetch("/api/quote-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quotePayload),
        });
      } catch (fetchError) {
        throw new Error(`Network error: ${fetchError.message}. Please check if the server is running.`);
      }

      let quoteJson;
      try {
        quoteJson = await quoteRes.json();
      } catch (parseError) {
        const text = await quoteRes.text().catch(() => "Unable to read response");
        throw new Error(`Invalid response from server: ${text.substring(0, 200)}`);
      }

      if (!quoteRes.ok || !quoteJson.ok) {
        const raw = quoteJson && (quoteJson.err || quoteJson.error);
        const msg =
          typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
        throw new Error(msg || "Failed to submit quote request");
      }

      const createdEstimateId = quoteJson.estimateId;
      const createdLocationId = quoteJson.locationId || process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

      // Store estimate and location IDs
      setEstimateId(createdEstimateId);
      setLocationId(createdLocationId);

      // Success! Portal invitation was already sent
      setShowEmailSentModal(true);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit quote request");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLoginSuccess = (loginResult) => {
    // User logged in successfully
    setShowLoginModal(false);
    setSubmitSuccess(true);
    // Redirect to portal with estimate
    if (estimateId) {
      const portalUrl = `/portal?estimateId=${estimateId}${locationId ? `&locationId=${locationId}` : ""}`;
      router.push(portalUrl);
    } else {
      router.push("/portal");
    }
  };

  function handleAddFromModal() {
    if (!detailAddonId) return;
    const currentQty = addonQuantities[detailAddonId] ?? 0;
    setAddonQuantity(detailAddonId, currentQty + 1);
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {currentStep === 1 && <CalculatorHero />}
      
      {/* Transition Overlay */}
      <TransitionOverlay
        isVisible={isTransitioning}
        progress={transitionProgress}
        message="Preparing your quote..."
      />
      
      {/* Step Container - Relative positioning for smooth transitions */}
      <div className="relative min-h-screen lg:min-h-[calc(100vh-200px)]">
        {/* Step 1: Configuration */}
        <main 
          className={`mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-10 lg:flex-row ${
            currentStep === 1 
              ? "opacity-100 translate-x-0 pointer-events-auto relative z-10 block" 
              : "opacity-0 pointer-events-none absolute inset-0 z-0 hidden lg:block lg:-translate-x-full"
          } transition-all duration-normal ease-standard`}
          style={{ 
            willChange: currentStep === 1 ? "auto" : "transform, opacity",
            transitionProperty: "transform, opacity",
          }}
        >
        <div className="flex-1 space-y-6">
          <PropertyProfileSelector
            profiles={propertyProfiles}
            activeId={profileId}
            onSelect={setProfileId}
            propertyFlags={propertyFlags}
            onToggleFlag={toggleFlag}
            onShowDetails={setDetailProfileId}
          />
          <CoveragePlanner
            coverage={coverage}
            onChange={setCoverageField}
            onRecommend={applyRecommendations}
            presets={presets}
            onApplyPreset={applyPreset}
          />
          <AddonsGrid
            catalog={addonCatalog}
            quantities={addonQuantities}
            onQuantityChange={setAddonQuantity}
            onShowDetails={setDetailAddonId}
          />
          <ServiceOptions services={services} onChange={updateService} />
        </div>
        <div className="w-full lg:w-[360px]">
          <SummaryPanel
            baseKit={baseKit}
            selectedAddons={selectedAddons}
            totals={totals}
            limitUsage={limitUsage}
            onAddToCart={handleAddToCart}
            inCart={inCart}
            hasConfigChanged={hasConfigChanged}
          />
        </div>
      </main>

        {/* Step 2: Contact Form */}
        <section 
          id="contact-form-section"
          className={`border-t bg-gradient-to-b from-background via-background to-muted/20 py-6 sm:py-8 md:py-10 ${
            currentStep === 2
              ? "opacity-100 translate-x-0 pointer-events-auto relative z-10 block"
              : "opacity-0 pointer-events-none absolute inset-0 z-0 hidden lg:block lg:translate-x-full"
          } transition-all duration-normal ease-standard`}
          style={{ 
            willChange: currentStep === 2 ? "auto" : "transform, opacity",
            transitionProperty: "transform, opacity",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Sticky Progress Bar */}
            <div className="mb-4 sm:mb-6">
              <QuoteWizardProgress 
                currentStep={currentStep} 
                onStepClick={handleStepNavigation}
                sticky
              />
            </div>

            {/* Back Button */}
            <div className="mb-3 sm:mb-4">
              <button
                type="button"
                onClick={handleBackToConfiguration}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Configuration
              </button>
            </div>

            {/* Configuration Summary Card - Moved to top for immediate visibility */}
            <div className="mb-4 sm:mb-6">
              <ConfigurationSummaryCard
                profile={activeProfile}
                addons={selectedAddons}
                coverage={coverage}
                onEdit={handleBackToConfiguration}
              />
            </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Form Card - Enhanced */}
            <div className="md:col-span-2">
              <div className="rounded-2xl md:rounded-[32px] border border-border bg-surface p-4 sm:p-6 md:p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                {/* Form Header with Icon */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50">
                  <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">Contact Information</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">We'll use this to create your account and send your quote</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitQuote} className="space-y-4 sm:space-y-6">
                  {/* Name Fields with Icons */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4 text-muted-foreground" />
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:border-border-subtle"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:border-border-subtle"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Contact Fields with Icons */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email address
                        <span className="text-error text-xs font-semibold">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:border-border-subtle"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:border-border-subtle"
                        placeholder="+61 400 000 000"
                      />
                    </div>
                  </div>

                  {/* Enhanced Error/Success Messages */}
                  {submitError ? (
                    <div className="rounded-xl border border-error/30 bg-error-bg p-4 animate-in fade-in slide-in-from-top-2 duration-normal">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                        <p className="text-sm text-error font-medium">{submitError}</p>
                      </div>
                    </div>
                  ) : null}

                  {submitSuccess && !showLoginModal ? (
                    <div className="rounded-xl border border-success/30 bg-success-bg p-4 animate-in fade-in slide-in-from-top-2 duration-normal">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        <p className="text-sm text-success font-medium">
                          Quote request submitted! Redirecting to portal...
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Enhanced Submit Button */}
                  <button
                    type="submit"
                    disabled={!inCart || !email || isSubmitting}
                    className={`w-full rounded-xl px-6 py-4 text-sm font-semibold transition-all duration-fast ease-standard flex items-center justify-center gap-2 ${
                      !inCart || !email || isSubmitting
                        ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                        : "bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Contact & Estimate…
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Redirecting to Portal…
                      </>
                    ) : (
                      <>
                        Submit & Request Quote
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {!inCart ? (
                    <div className="rounded-xl border border-warning/30 bg-warning-bg/50 p-3 text-center">
                      <p className="text-xs text-warning font-medium flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Please add configuration to cart first
                      </p>
                    </div>
                  ) : null}
                </form>
              </div>
            </div>

            {/* Enhanced Quote Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl md:rounded-[32px] border border-border bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-4 sm:p-6 shadow-lg lg:sticky lg:top-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Quote Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl bg-background/80 backdrop-blur-sm p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Property Profile</p>
                    <p className="text-base font-semibold text-foreground">
                      {activeProfile?.title ?? "Custom"}
                    </p>
                  </div>
                  
                  <div className="rounded-xl bg-background/80 backdrop-blur-sm p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Status</p>
                    <p className="text-sm font-semibold text-success flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Ready for quote
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">What happens next?</p>
                    <ul className="space-y-2.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <span className="text-primary mt-0.5 font-bold">✓</span>
                        <span>We'll create your contact & estimate</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-primary mt-0.5 font-bold">✓</span>
                        <span>You'll receive a portal link via email</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-primary mt-0.5 font-bold">✓</span>
                        <span>View & manage your quote online</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>

      <AddonDetailModal
        addon={detailAddon}
        open={Boolean(detailAddon)}
        onClose={() => setDetailAddonId(null)}
        onAdd={handleAddFromModal}
        quantity={detailAddonId ? addonQuantities[detailAddonId] ?? 0 : 0}
        activeProfile={activeProfile}
      />

      <PropertyProfileModal
        profile={propertyProfiles.find((p) => p.id === detailProfileId)}
        open={Boolean(detailProfileId)}
        onClose={() => setDetailProfileId(null)}
        onSelect={setProfileId}
      />

      {/* Login Modal - shown when account exists */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        email={email}
        estimateId={estimateId}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Email Sent Modal - shown when account doesn't exist */}
      {showEmailSentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quote Submitted Successfully! 📧</h2>
            <p className="text-gray-600 mb-4">
              We've sent your quote details to <strong className="text-gray-900">{email}</strong>. 
              Please check your inbox for a link to access your portal.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Use the portal link in the email to view your quote and upload installation photos.
            </p>
            <button
              onClick={() => setShowEmailSentModal(false)}
              className="w-full text-white rounded-md px-4 py-2 transition-colors font-medium"
              style={{ backgroundColor: '#c95375' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b34563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#c95375'}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildHtmlEmail({ firstName, totals, activeProfile, selectedAddons, coverage }) {
  const addonList =
    selectedAddons.length > 0
      ? `<ul>${selectedAddons
          .map((item) => `<li>${item.quantity} × ${item.name}</li>`)
          .join("")}</ul>`
      : "<p>No optional add-ons selected.</p>";
  const coverageLine = `Doors ${coverage.doors}, windows ${coverage.windows}, glass walls ${coverage.glassWalls}, outdoor zones ${coverage.outdoorZones}, panic buttons ${coverage.panicButtons}`;
  return `
    <p>Hi ${firstName || "there"},</p>
    <p>Thanks for building an Ajax Hub 2 package. Here's the snapshot we received:</p>
    <p><strong>Profile:</strong> ${activeProfile?.title ?? "Custom"} — ${activeProfile?.scopeGuide ?? ""}<br/>
    <strong>Coverage inputs:</strong> ${coverageLine}</p>
    <p><strong>Add-ons selected:</strong></p>
    ${addonList}
    <p>We'll review the coverage, request photos if needed, and send the refined estimate with pricing in your portal.</p>
    <p>— CheapAlarms</p>
  `;
}

function buildTextEmail({ firstName, totals, activeProfile, selectedAddons, coverage }) {
  const addons =
    selectedAddons.length > 0
      ? selectedAddons.map((item) => `- ${item.quantity} x ${item.name}`).join("\n")
      : "- No optional add-ons selected";
  const coverageLine = `Doors ${coverage.doors}, windows ${coverage.windows}, glass walls ${coverage.glassWalls}, outdoor zones ${coverage.outdoorZones}, panic buttons ${coverage.panicButtons}`;
  return `Hi ${firstName || "there"},\n\n` +
    `Thanks for building an Ajax Hub 2 package. Here's what we received:\n` +
    `Profile: ${activeProfile?.title ?? "Custom"} — ${activeProfile?.scopeGuide ?? ""}\n` +
    `Coverage inputs: ${coverageLine}\n` +
    `Add-ons:\n${addons}\n\n` +
    `We'll review everything, update the estimate with pricing, and share it in your portal.\n\n— CheapAlarms`;
}

