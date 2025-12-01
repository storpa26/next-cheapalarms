import { ArrowRight, Shield, Sparkles, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAcceptEstimate, useRejectEstimate, useRetryInvoice } from "@/lib/react-query/hooks";
import { Spinner } from "@/components/ui/spinner";

export function ApprovalCard({ view, estimateId, locationId, onUploadPhotos }) {
  const quoteStatus = view?.quote?.status || "sent";
  const hasPhotos = (view?.photos?.items?.length || 0) > 0;
  const total = view?.quote?.total || 0;
  const scheduledFor = view?.installation?.scheduledFor;
  const invoice = view?.invoice;
  const invoiceError = view?.invoiceError; // Invoice creation error from API
  const isPending = quoteStatus === "sent" || quoteStatus === "pending"; // Support both for backward compatibility
  const isAccepted = quoteStatus === "accepted";
  const isRejected = quoteStatus === "rejected";
  const acceptedAt = view?.quote?.acceptedAt;

  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const acceptMutation = useAcceptEstimate();
  const rejectMutation = useRejectEstimate();
  const retryInvoiceMutation = useRetryInvoice();

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending || retryInvoiceMutation.isPending;

  const handleAccept = async () => {
    if (!hasPhotos) {
      setShowPhotoWarning(true);
      return;
    }
    await handleConfirmAccept();
  };

  const handleConfirmAccept = async () => {
    if (!estimateId) {
      alert("Missing estimate ID");
      return;
    }
    if (!locationId) {
      console.warn("locationId not provided, proceeding without it");
    }
    try {
      const result = await acceptMutation.mutateAsync({ 
        estimateId, 
        locationId: locationId || undefined 
      });
      setShowPhotoWarning(false);
      // Success - the mutation will automatically refetch and update the UI
    } catch (error) {
      console.error("Accept estimate error:", error);
      alert(error.message || "Failed to accept estimate. Please try again.");
    }
  };

  const handleReject = () => {
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    if (!estimateId || !locationId) return;
    try {
      await rejectMutation.mutateAsync({ estimateId, locationId, reason: rejectReason });
      setShowRejectConfirm(false);
      setRejectReason("");
    } catch (error) {
      alert(error.message || "Failed to reject estimate");
    }
  };

  const handleRetryInvoice = async () => {
    if (!estimateId || !locationId) return;
    try {
      await retryInvoiceMutation.mutateAsync({ 
        estimateId, 
        locationId,
        inviteToken: view?.account?.inviteToken 
      });
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Retry invoice error:", error);
    }
  };

  return (
    <>
      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Approval & payment</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Finalize estimate</h3>
            <p className="text-sm text-slate-500">
              {isPending
                ? "Review and accept or reject your estimate"
                : isAccepted
                  ? "Your estimate has been accepted"
                  : "This estimate has been rejected"}
            </p>
          </div>
          <div className="rounded-full bg-secondary/15 p-4">
            <Shield className="h-6 w-6 text-secondary" />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Estimate total</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {mounted && total > 0 ? `$${total.toLocaleString("en-AU")}` : total > 0 ? `$${total}` : "—"}
            </p>
            <p className="text-xs text-slate-500">
              {hasPhotos ? "Final pricing" : "Preliminary pricing"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Install window</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {mounted && scheduledFor
                ? new Date(scheduledFor).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : scheduledFor
                  ? new Date(scheduledFor).toISOString().split("T")[0]
                  : "TBD"}
            </p>
            <p className="text-xs text-slate-500">Tentative until approval</p>
          </div>
        </div>

        {/* Status Display */}
        {isAccepted && (
          <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">✓ Estimate Accepted</p>
            </div>
            {acceptedAt && (
              <p className="text-xs text-emerald-600 mt-1">
                Accepted on{" "}
                {mounted
                  ? new Date(acceptedAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(acceptedAt).toISOString().split("T")[0]}
              </p>
            )}
          </div>
        )}

        {invoice && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Invoice</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {invoice.number || invoice.id || "Pending number"}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  Status: {invoice.status || "pending"}
                </p>
              </div>
              {invoice.url && (
                <a
                  href={invoice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 transition"
                >
                  View & Pay
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-semibold text-red-800">✗ Estimate Rejected</p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              If you have questions, please contact support.
            </p>
          </div>
        )}

        {/* Invoice Error - Show retry option */}
        {isAccepted && invoiceError && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Invoice Creation Failed</p>
                <p className="mt-1 text-xs text-amber-700">{invoiceError}</p>
                <button
                  type="button"
                  onClick={handleRetryInvoice}
                  disabled={isProcessing}
                  className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Retrying..." : "Retry Invoice Creation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Only show when pending and not rejected */}
        {isPending && !isRejected && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  Accept Estimate <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-red-700 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  Reject Estimate <XCircle className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Info message when pending */}
        {isPending && !hasPhotos && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Consider uploading photos before accepting. Your estimate cost may reduce once we review your property photos.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Photo Warning Modal */}
      {showPhotoWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">No Photos Uploaded</h3>
                <p className="mt-2 text-sm text-slate-600">
                  You haven't uploaded photos yet. Your estimate cost may reduce once we review your property photos.
                  Do you want to proceed with acceptance anyway?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isProcessing) {
                    handleConfirmAccept();
                  }
                }}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Accept Anyway"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPhotoWarning(false);
                  // Use setTimeout to ensure modal closes before navigation
                  setTimeout(() => {
                    onUploadPhotos?.();
                  }, 100);
                }}
                disabled={isProcessing}
                className="flex-1 rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Photos First
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Reject Estimate?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to reject this estimate? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Let us know why you're rejecting this estimate..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmReject();
                }}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Confirm Reject"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRejectConfirm(false);
                  setRejectReason("");
                }}
                disabled={isProcessing}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
