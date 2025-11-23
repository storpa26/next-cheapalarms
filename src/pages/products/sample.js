import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import CalculatorHero from "../../components/products/calculator/CalculatorHero";
import PropertyProfileSelector from "../../components/products/calculator/PropertyProfileSelector";
import CoveragePlanner from "../../components/products/calculator/CoveragePlanner";
import AddonsGrid from "../../components/products/calculator/AddonsGrid";
import ServiceOptions from "../../components/products/calculator/ServiceOptions";
import SummaryPanel from "../../components/products/calculator/SummaryPanel";
import AddonDetailModal from "../../components/products/calculator/AddonDetailModal";
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

  const [inCart, setInCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [estimateId, setEstimateId] = useState(null);
  const [locationId, setLocationId] = useState(null);

  const router = useRouter();
  const [detailAddonId, setDetailAddonId] = useState(null);

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

  function handleAddToCart() {
    setInCart(true);
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
      // Step 1: Create GHL contact
      let contactRes;
      try {
        contactRes = await fetch("/api/ghl/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, phone }),
        });
      } catch (fetchError) {
        throw new Error(`Network error: ${fetchError.message}. Please check if the server is running.`);
      }

      let contactJson;
      try {
        contactJson = await contactRes.json();
      } catch (parseError) {
        const text = await contactRes.text().catch(() => "Unable to read response");
        throw new Error(`Invalid response from server: ${text.substring(0, 200)}`);
      }

      if (!contactRes.ok || !contactJson.ok) {
        const raw = contactJson && contactJson.error;
        const msg =
          typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
        throw new Error(msg || "Failed to create contact");
      }

      const contactId = extractContactId(contactJson.contact);
      if (!contactId) {
        throw new Error("Contact created but ID missing in response");
      }

      // Step 2: Get locationId from env or use default
      const effectiveLocationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID || null;

      // Step 3: Build line items from calculator data
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
          });
        }
      }
      
      if (services.cellularBackup) {
        items.push({
          name: "Cellular Backup",
          description: "Cellular backup service",
          amount: 18,
          qty: 1,
        });
      }
      
      if (services.extendedWarrantyYears > 0) {
        items.push({
          name: `Extended Warranty - ${services.extendedWarrantyYears} ${services.extendedWarrantyYears === 1 ? "Year" : "Years"}`,
          description: `Extended warranty coverage`,
          amount: 89 * services.extendedWarrantyYears,
          qty: 1,
        });
      }

      // Step 4: Build estimate payload
      // Format phone to E.164 format (required by GHL)
      const formattedPhone = phone 
        ? (phone.startsWith("+") ? phone : `+61${phone.replace(/^0/, "").replace(/\s+/g, "")}`)
        : "";

      const estimatePayload = {
        ...(effectiveLocationId && { altId: effectiveLocationId }),
        altType: "location",
        name: `Ajax Hub 2 Configuration - ${activeProfile?.title || "Custom"}`,
        title: "ESTIMATE",
        businessDetails: {
          name: "Cheap Alarms",
          address: {
            addressLine1: "Cheap Alarms Pty Ltd",
            city: "Brisbane",
            state: "QLD",
            postalCode: "4000",
            countryCode: "AU"
          }
        },
        currency: "AUD",
        items: items.map(item => ({
          ...item,
          currency: "AUD", // Each item needs currency field
          type: "one_time", // Required by GHL - must be "one_time" or "recurring"
          taxInclusive: true, // Required by GHL
        })),
        discount: { type: "percentage", value: 0 },
        termsNotes: "<p>Quote generated from website configurator.</p>",
        contactDetails: {
          id: contactId, // Include the contactId to link the estimate to the contact
          email: email,
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email,
          phoneNo: formattedPhone,
          address: {
            addressLine1: "Address not provided",
            city: "TBD",
            state: "TBD",
            postalCode: "TBD",
            countryCode: "AU"
          }
        },
        issueDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        frequencySettings: { enabled: false },
        liveMode: true
      };

      // Step 5: Create estimate
      let estimateRes;
      try {
        estimateRes = await fetch("/api/estimate/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(estimatePayload),
        });
      } catch (fetchError) {
        throw new Error(`Network error: ${fetchError.message}. Please check if the server is running.`);
      }

      let estimateJson;
      try {
        estimateJson = await estimateRes.json();
      } catch (parseError) {
        const text = await estimateRes.text().catch(() => "Unable to read response");
        throw new Error(`Invalid response from server: ${text.substring(0, 200)}`);
      }

      if (!estimateRes.ok || !estimateJson.ok) {
        const raw = estimateJson && (estimateJson.err || estimateJson.error);
        const msg =
          typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
        throw new Error(msg || "Failed to create estimate");
      }

      const createdEstimateId = estimateJson.estimateId || estimateJson.result?.estimate?.id || estimateJson.result?.id || estimateJson.result?._id;
      const createdLocationId = effectiveLocationId || estimateJson.locationId;

      // Store estimate and location IDs
      setEstimateId(createdEstimateId);
      setLocationId(createdLocationId);

      // Step 6: Handle account flow
      if (estimateJson.accountExists) {
        // Account exists - show login modal
        setShowLoginModal(true);
        setSubmitSuccess(false);
      } else {
        // New account - send password reset email via GHL
        try {
          const resetRes = await fetch("/api/auth/send-password-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: email,
              estimateId: createdEstimateId,
              locationId: createdLocationId 
            }),
          });
          
          const resetJson = await resetRes.json();
          if (resetRes.ok && resetJson.ok) {
            // Show modal saying email was sent
            setShowEmailSentModal(true);
            setSubmitSuccess(true);
          } else {
            throw new Error(resetJson.error || resetJson.err || "Failed to send password reset email");
          }
        } catch (err) {
          setSubmitError(err.message || "Failed to send password reset email");
        }
      }
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
    <div className="min-h-screen bg-slate-50">
      <CalculatorHero />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <PropertyProfileSelector
            profiles={propertyProfiles}
            activeId={profileId}
            onSelect={setProfileId}
            propertyFlags={propertyFlags}
            onToggleFlag={toggleFlag}
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
          />
        </div>
      </main>

      <section className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Ready to proceed?</p>
            <h2 className="text-2xl font-semibold">Submit Your Quote Request</h2>
            <p className="text-sm text-muted-foreground">
              Enter your contact details below. We'll create your contact and estimate, then send you a portal link.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border p-6">
              <h3 className="text-lg font-semibold">Contact Details & Quote Request</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We'll create your contact and estimate, then send you a portal link to view your quote.
              </p>
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <p className="font-medium mb-1">Quote Summary</p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Total: ${totals.totalIncGst.toFixed(0)} inc GST</li>
                    <li>Property profile: {activeProfile?.title ?? "Custom"}</li>
                  </ul>
                </div>

                {submitError ? (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    {submitError}
                  </div>
                ) : null}

                {submitSuccess && !showLoginModal ? (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                    Quote request submitted! Redirecting to portal...
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!inCart || !email || isSubmitting}
                  className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
                    !inCart || !email || isSubmitting
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting
                    ? "Creating Contact & Estimate…"
                    : submitSuccess
                    ? "Redirecting to Portal…"
                    : "Submit & Request Quote"}
                </button>

                {!inCart ? (
                  <p className="text-xs text-muted-foreground text-center">
                    Please add configuration to cart first.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>

      <AddonDetailModal
        addon={detailAddon}
        open={Boolean(detailAddon)}
        onClose={() => setDetailAddonId(null)}
        onAdd={handleAddFromModal}
        quantity={detailAddonId ? addonQuantities[detailAddonId] ?? 0 : 0}
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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Email Sent</h2>
            <p className="text-muted-foreground mb-4">
              We've sent a password setup email to <strong className="text-foreground">{email}</strong>. 
              Please check your inbox and follow the instructions to set your password.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Once you've set your password, you'll be able to access your quote and upload photos.
            </p>
            <button
              onClick={() => setShowEmailSentModal(false)}
              className="w-full bg-emerald-600 text-white rounded-md px-4 py-2 hover:bg-emerald-700 transition-colors"
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
    <p>Thanks for building an Ajax Hub 2 package. Here’s the snapshot we received:</p>
    <p><strong>Total:</strong> $${totals.totalIncGst.toFixed(0)} inc GST<br/>
    <strong>Profile:</strong> ${activeProfile?.title ?? "Custom"} — ${activeProfile?.scopeGuide ?? ""}<br/>
    <strong>Coverage inputs:</strong> ${coverageLine}</p>
    <p><strong>Add-ons selected:</strong></p>
    ${addonList}
    <p>We’ll review the coverage, request photos if needed, and send the refined estimate in your portal.</p>
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
    `Thanks for building an Ajax Hub 2 package. Here’s what we received:\n` +
    `Total: $${totals.totalIncGst.toFixed(0)} inc GST\n` +
    `Profile: ${activeProfile?.title ?? "Custom"} — ${activeProfile?.scopeGuide ?? ""}\n` +
    `Coverage inputs: ${coverageLine}\n` +
    `Add-ons:\n${addons}\n\n` +
    `We’ll review everything, update the estimate, and share it in your portal.\n\n— CheapAlarms`;
}

