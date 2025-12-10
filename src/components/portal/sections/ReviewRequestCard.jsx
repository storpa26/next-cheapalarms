import { Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useState } from "react";

const BRAND_ROSE = "#c95375";
const BRAND_TEAL = "#2fb6c9";

// Mock data - will be replaced with real data later
const mockReviewStatus = "pending_review"; // "pending_review" | "under_review" | "reviewed"

const statusConfig = {
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "You can request a review of your estimate",
  },
  under_review: {
    label: "Under Review",
    icon: AlertCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Your estimate is being reviewed by our team",
  },
  reviewed: {
    label: "Reviewed",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Review complete. Check for updated pricing.",
  },
};

export function ReviewRequestCard({ estimateId, estimate }) {
  // Mock state - will be replaced with real data from view prop later
  const [reviewStatus, setReviewStatus] = useState(mockReviewStatus);
  
  const config = statusConfig[reviewStatus] || statusConfig.pending_review;
  const Icon = config.icon;

  const handleRequestReview = () => {
    // Mock action - will be replaced with API call later
    setReviewStatus("under_review");
  };

  return (
    <div 
      className="relative rounded-xl border-2 bg-white p-6 shadow-lg h-full"
      style={{
        borderColor: reviewStatus === "pending_review" ? "#fbbf24" : reviewStatus === "under_review" ? "#3b82f6" : "#10b981",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${config.bg}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quote Review</h2>
            <p className="text-xs text-slate-500">Request professional review</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg} ${config.border} border mb-4`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>

        <p className="text-sm text-slate-600 mb-6">{config.description}</p>

        {/* Estimate Info */}
        {estimate && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Estimate ID</span>
              <span className="text-sm font-semibold text-slate-900">{estimateId || estimate.number || "—"}</span>
            </div>
            {estimate.address && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Address</span>
                <span className="text-sm font-semibold text-slate-900 truncate ml-2">{estimate.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {reviewStatus === "pending_review" && (
          <button
            onClick={handleRequestReview}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${BRAND_ROSE}, ${BRAND_TEAL})`,
            }}
          >
            <Send className="h-5 w-5" />
            <span>Request Review</span>
          </button>
        )}

        {reviewStatus === "under_review" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Review in Progress</p>
                <p className="text-xs text-blue-700">
                  Our team is reviewing your estimate. You'll be notified when complete.
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 text-center">
              Estimated review time: 24-48 hours
            </div>
          </div>
        )}

        {reviewStatus === "reviewed" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-900 mb-1">Review Complete</p>
                <p className="text-xs text-emerald-700">
                  Check your estimate for updated pricing and notes from our team.
                </p>
              </div>
            </div>
            <button
              className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${BRAND_TEAL}, ${BRAND_ROSE})`,
              }}
            >
              View Updated Estimate
            </button>
          </div>
        )}

        {/* Admin Photo Requests (Demo) */}
        {reviewStatus === "under_review" && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
              Photo Requests
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-amber-900">
                  Please upload photo of existing alarm system
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


