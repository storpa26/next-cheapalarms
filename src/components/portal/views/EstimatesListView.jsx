import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatAddress } from "@/components/portal/utils/portal-utils";

import { useState } from "react";
import { ChevronDown, CheckCircle, Clock, AlertCircle, FileText, X } from "lucide-react";

const BRAND_ROSE = "#c95375";
const BRAND_TEAL = "#2fb6c9";

const statusIcons = {
  sent: Clock,
  under_review: AlertCircle,
  accepted: CheckCircle,
  rejected: X,
};

const statusColors = {
  sent: "text-amber-600 bg-amber-50 border-amber-200",
  under_review: "text-blue-600 bg-blue-50 border-blue-200",
  accepted: "text-emerald-600 bg-emerald-50 border-emerald-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
};

export function EstimatesListView({ estimates, loading, error, onSelectEstimate, resumeEstimate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedEstimate = estimates[selectedIndex];
  const selectedStatus = selectedEstimate?.status || "sent";
  const StatusIcon = statusIcons[selectedStatus] || FileText;
  const statusColor = statusColors[selectedStatus] || statusColors.sent;

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">My estimates</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Select a project</h1>
          <p className="text-sm text-slate-500">
            Pick an estimate to continue. We&apos;ll remember your last viewed site for next time.
          </p>
        </div>
        {resumeEstimate && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right shadow-inner">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Resume last viewed</p>
            <p className="text-sm font-semibold text-slate-900">
              {resumeEstimate.label || `Estimate #${resumeEstimate.number || resumeEstimate.estimateId}`}
            </p>
            <button
              type="button"
              onClick={() => onSelectEstimate(resumeEstimate.estimateId || resumeEstimate.id)}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100"
            >
              Resume <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="text-sm font-semibold">Error loading estimates</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      ) : estimates.length > 0 ? (
        <>
          {/* Estimate Switcher Dropdown */}
          <div className="mt-6 relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-[#c95375] transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusColor.split(" ")[1]} ${statusColor.split(" ")[2]}`}>
                  <StatusIcon className={`h-4 w-4 ${statusColor.split(" ")[0]}`} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">
                    {selectedEstimate?.label || `Estimate #${selectedEstimate?.number || selectedEstimate?.estimateId || selectedIndex + 1}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatAddress(selectedEstimate?.address || selectedEstimate?.meta?.address) || "Site address pending"}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border-2 border-slate-200 bg-white shadow-2xl z-20 overflow-hidden">
                {estimates.map((estimate, idx) => {
                  const estId = estimate.estimateId || estimate.id;
                  const estStatus = estimate.status || "sent";
                  const EstStatusIcon = statusIcons[estStatus] || FileText;
                  const estStatusColor = statusColors[estStatus] || statusColors.sent;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={estId}
                      onClick={() => {
                        setSelectedIndex(idx);
                        setIsOpen(false);
                        onSelectEstimate(estId);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition ${
                        isSelected ? "bg-rose-50 border-l-4" : ""
                      }`}
                      style={{
                        borderLeftColor: isSelected ? BRAND_ROSE : "transparent",
                      }}
                    >
                      <div className={`p-2 rounded-lg ${estStatusColor.split(" ")[1]} ${estStatusColor.split(" ")[2]}`}>
                        <EstStatusIcon className={`h-4 w-4 ${estStatusColor.split(" ")[0]}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-slate-900">
                          {estimate.label || `Estimate #${estimate.number || estId}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatAddress(estimate.address || estimate.meta?.address) || "Site address pending"}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-[#c95375]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Estimate Details */}
          {selectedEstimate && (
            <div className="mt-6 p-4 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusColor}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold capitalize">{selectedStatus.replace("_", " ")}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Address</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatAddress(selectedEstimate.address || selectedEstimate.meta?.address) || "Pending"}
                  </span>
                </div>
                {selectedEstimate.total && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-[#c95375] to-[#2fb6c9] bg-clip-text text-transparent">
                      ${selectedEstimate.total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Estimates Summary */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
              All Estimates ({estimates.length})
            </p>
            <div className="space-y-2">
              {estimates.map((estimate, idx) => {
                const estId = estimate.estimateId || estimate.id;
                const estStatus = estimate.status || "sent";
                const EstStatusIcon = statusIcons[estStatus] || FileText;
                const estStatusColor = statusColors[estStatus] || statusColors.sent;
                
                return (
                  <div
                    key={estId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                    onClick={() => {
                      setSelectedIndex(idx);
                      onSelectEstimate(estId);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <EstStatusIcon className={`h-4 w-4 ${estStatusColor.split(" ")[0]}`} />
                      <span className="text-sm font-semibold text-slate-900">
                        {estimate.label || `Estimate #${estimate.number || estId}`}
                      </span>
                    </div>
                    {estimate.total && (
                      <span className="text-sm font-semibold text-slate-600">
                        ${estimate.total.toLocaleString("en-AU")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No estimates found. Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}

