import { useMemo, useState } from "react";
import CalculatorHero from "../../components/products/calculator/CalculatorHero";
import PropertyProfileSelector from "../../components/products/calculator/PropertyProfileSelector";
import CoveragePlanner from "../../components/products/calculator/CoveragePlanner";
import AddonsGrid from "../../components/products/calculator/AddonsGrid";
import ServiceOptions from "../../components/products/calculator/ServiceOptions";
import SummaryPanel from "../../components/products/calculator/SummaryPanel";
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
  const DEV_CONTACT_ID = "I0x5hG9wIE5LZeQymrXV";
  const enableLeadForm = false;
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
  const [creatingContact, setCreatingContact] = useState(false);
  const [contactCreated, setContactCreated] = useState(Boolean(DEV_CONTACT_ID));
  const [contactError, setContactError] = useState("");
  const [contactId, setContactId] = useState(DEV_CONTACT_ID);

  const [sendingQuote, setSendingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const activeProfile = useMemo(
    () => propertyProfiles.find((profile) => profile.id === profileId),
    [propertyProfiles, profileId],
  );

  async function handleCreateContact(e) {
    e.preventDefault();
    setContactError("");
    setCreatingContact(true);
    try {
      const res = await fetch("/api/ghl/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const raw = json && json.error;
        const msg =
          typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
        throw new Error(msg || "Failed to create contact");
      }
      const id = extractContactId(json.contact);
      if (!id) {
        setContactCreated(false);
        throw new Error("Contact created but ID missing in response");
      }
      setContactId(id);
      setContactCreated(true);
      setContactError("");
      setQuoteSuccess(false);
    } catch (err) {
      setContactError(err.message || "Failed to create contact");
    } finally {
      setCreatingContact(false);
    }
  }

  function handleAddToCart() {
    setInCart(true);
  }

  async function handleRequestQuote() {
    setQuoteError("");
    setQuoteSuccess(false);
    setSendingQuote(true);
    try {
      const res = await fetch("/api/ghl/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          subject: `Your ${baseKit.name} configuration`,
          html: buildHtmlEmail({
            firstName,
            totals,
            activeProfile,
            selectedAddons,
            coverage,
          }),
          text: buildTextEmail({
            firstName,
            totals,
            activeProfile,
            selectedAddons,
            coverage,
          }),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const raw = json && json.error;
        const msg =
          typeof raw === "string" ? raw : raw && raw.message ? raw.message : JSON.stringify(raw || {});
        throw new Error(msg || "Failed to send quote email");
      }
      setQuoteSuccess(true);
    } catch (err) {
      setQuoteError(err.message || "Failed to send quote email");
    } finally {
      setSendingQuote(false);
    }
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
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Next steps</p>
            <h2 className="text-2xl font-semibold">Share details & request your quote</h2>
            <p className="text-sm text-muted-foreground">
              We’ll attach this configuration, send the staged email, and surface it in the portal
              demo workflow.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border p-6">
              <h3 className="text-lg font-semibold">Contact details</h3>
              <p className="text-sm text-muted-foreground">
                We create a GHL contact so later steps (estimate, portal invite, scheduling) can link
                back to this quote.
              </p>
              {enableLeadForm ? (
                <form onSubmit={handleCreateContact} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        required
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
                      <label className="mb-1 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        required={!phone}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        required={!email}
                      />
                    </div>
                  </div>
                  {contactError ? <div className="text-sm text-red-600">{contactError}</div> : null}
                  <button
                    type="submit"
                    disabled={creatingContact || contactCreated}
                    className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      creatingContact || contactCreated
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {contactCreated ? "Contact Created" : creatingContact ? "Submitting..." : "Submit"}
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Lead form temporarily disabled for faster testing. Using contact ID{" "}
                  <code className="font-mono">{DEV_CONTACT_ID}</code>.
                </div>
              )}
            </div>
            <div className="rounded-2xl border p-6">
              <h3 className="text-lg font-semibold">Send the staged email</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Includes total (${totals.totalIncGst.toFixed(0)} inc GST) and coverage summary.</li>
                <li>Mentions selected property profile ({activeProfile?.title ?? "Custom"}).</li>
                <li>Builds the GHL conversation thread we reuse later.</li>
              </ul>
              <button
                type="button"
                onClick={handleRequestQuote}
                disabled={!inCart || !contactCreated || !contactId || sendingQuote}
                className={`mt-4 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
                  !inCart || !contactCreated || !contactId || sendingQuote
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {sendingQuote ? "Sending…" : quoteSuccess ? "Quote Sent" : "Request Quote Email"}
              </button>
              {!inCart ? (
                <div className="mt-2 text-xs text-muted-foreground">Add the configuration first.</div>
              ) : null}
              {inCart && (!contactCreated || !contactId) ? (
                <div className="mt-2 text-xs text-muted-foreground">Create the contact to continue.</div>
              ) : null}
              {quoteError ? <div className="mt-2 text-sm text-red-600">{quoteError}</div> : null}
              {quoteSuccess ? (
                <div className="mt-2 text-sm text-emerald-700">
                  Email sent via GHL Conversations. Check the Messages tab to confirm.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
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

