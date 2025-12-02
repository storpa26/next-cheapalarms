import { ArrowRight, Camera, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function OverviewView({ estimate, onUploadImages, onViewDetails, onViewAll }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure consistent rendering between server and client
  // During SSR, if estimate is null, always render the welcome message
  // On client, wait until mounted to avoid hydration mismatch
  if (!estimate) {
    return (
      <div 
        className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] text-center"
        suppressHydrationWarning
      >
        <h1 className="text-3xl font-semibold text-slate-900">Welcome to Your Portal</h1>
        <p className="mt-2 text-slate-500">Request a quote to get started.</p>
      </div>
    );
  }

  const hasPhotos = (estimate.photosCount || 0) > 0;
  // Use statusValue (portal status: sent/accepted/rejected) not display status
  const statusValue = estimate.statusValue || estimate.status || "sent";
  const needsPhotos = !hasPhotos && statusValue !== "accepted";

  // Calculate totals
  const subtotal = estimate.subtotal || 0;
  const taxTotal = estimate.taxTotal || 0;
  const total = estimate.total || subtotal + taxTotal;

  // Format currency consistently - use toFixed for SSR, toLocaleString after mount
  // This ensures server and client render the same initial value
  const formatCurrency = (amount) => {
    if (mounted) {
      return `$${amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Your Estimate</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">
              {estimate.label || `Estimate #${estimate.number || estimate.estimateId}`}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {estimate.address || estimate.meta?.address || "Site address pending"}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <span className="text-sm font-semibold text-primary">{estimate.statusLabel || estimate.status}</span>
            </div>
          </div>
          {onViewAll && (
            <Link href="/portal?section=estimates">
              <Button variant="outline" size="sm">
                View All Estimates <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Photo Upload Callout */}
        {needsPhotos && (
          <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Upload Photos for Accurate Pricing</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Our team needs photos of your property to provide you with the most accurate pricing. The current
                  estimate is preliminary and may change once we review your photos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              {needsPhotos ? "Estimated Total" : "Estimate Total"}
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-900" suppressHydrationWarning>
              {formatCurrency(total)}
            </p>
            {needsPhotos && (
              <p className="mt-1 text-xs text-slate-500">Preliminary pricing • Updates after photo review</p>
            )}
            {hasPhotos && (
              <p className="mt-1 text-xs text-emerald-600">✓ Photos uploaded • Final pricing</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Breakdown</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900" suppressHydrationWarning>
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {taxTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold text-slate-900" suppressHydrationWarning>
                    {formatCurrency(taxTotal)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product/Items List */}
        {estimate.items && estimate.items.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">Products & Services</h3>
            <div className="mt-4 space-y-3">
              {estimate.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name || "Item"}</p>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    )}
                    {item.sku && (
                      <p className="mt-1 text-xs text-slate-400">SKU: {item.sku}</p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      Qty: {item.qty || item.quantity || 1}
                    </p>
                    {item.amount && (
                      <p className="mt-1 text-sm text-slate-600" suppressHydrationWarning>
                        {formatCurrency(item.amount * (item.qty || item.quantity || 1))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          {needsPhotos && (
            <Button
              size="lg"
              onClick={onUploadImages}
              className="flex-1 bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
            >
              <Camera className="mr-2 h-5 w-5" />
              Upload Images
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={onViewDetails}
            className="flex-1 border-slate-200"
          >
            View Full Details <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

