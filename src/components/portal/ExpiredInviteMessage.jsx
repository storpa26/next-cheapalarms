import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";

/**
 * Friendly error message for expired invite tokens
 * Shows actionable next steps instead of a generic error
 */
export function ExpiredInviteMessage({ estimateId, onRequestNewInvite }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequestInvite = async () => {
    setRequesting(true);
    try {
      if (onRequestNewInvite) {
        await onRequestNewInvite();
      }
      setRequested(true);
    } catch (error) {
      // Error handled by parent
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="rounded-[32px] border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-[0_25px_80px_rgba(245,158,11,0.15)]">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-amber-100 p-4">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">Invite Link Expired</h2>
          <p className="mt-2 text-slate-700">
            This portal invite link has expired. Invite links are valid for 7 days for security.
          </p>
          
          {!requested ? (
            <>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">What happens next?</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">1</span>
                    <span>Click the button below to request a new invite link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">2</span>
                    <span>Our team will be notified and will send you a fresh link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">3</span>
                    <span>Check your email inbox (usually arrives within minutes)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleRequestInvite}
                disabled={requesting}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Request New Invite Link
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Request Sent!</p>
                  <p className="mt-1 text-sm text-green-700">
                    We've notified our team. You should receive a new invite link in your email shortly.
                  </p>
                  <p className="mt-2 text-xs text-green-600">
                    Check your spam folder if you don't see it within 10 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Need Help?
            </p>
            <p className="text-sm text-slate-700">
              If you continue having issues, please contact our support team at{" "}
              <a href="mailto:support@cheapalarms.com.au" className="font-semibold text-primary hover:underline">
                support@cheapalarms.com.au
              </a>
              {estimateId && (
                <>
                  {" "}and mention estimate <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">#{estimateId}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

