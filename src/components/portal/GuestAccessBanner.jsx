import { Info, X, UserPlus, LogIn, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

/**
 * Beautiful guest access banner with brand colors
 * Shows when user is viewing portal via invite token (read-only mode)
 */
export function GuestAccessBanner({ 
  daysRemaining, 
  estimateId,
  onDismiss,
  onCreateAccount,
  onSignIn 
}) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleCreateAccount = () => {
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      // Default: redirect to account creation
      router.push(`/set-password?estimateId=${estimateId}`);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      // Default: redirect to login
      router.push(`/login?redirect=/portal?estimateId=${estimateId}`);
    }
  };

  if (!visible) return null;

  return (
    <div className="rounded-[32px] border-2 border-[#c95375]/30 bg-gradient-to-br from-rose-50 via-white to-teal-50 p-6 shadow-[0_25px_80px_rgba(201,83,117,0.12)]">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="rounded-full bg-[#c95375]/10 p-3 flex-shrink-0">
          <Info className="h-6 w-6 text-[#c95375]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#c95375]" />
                Viewing as Guest
              </h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                You're viewing this estimate with a temporary link. Create an account for full access to accept, reject, upload photos, and manage your installation.
              </p>
              
              {/* Days Remaining Badge */}
              {daysRemaining !== null && daysRemaining >= 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200">
                  <span className="text-xs font-semibold text-teal-800">
                    {daysRemaining === 0 
                      ? "Expires today" 
                      : daysRemaining === 1 
                        ? "1 day remaining" 
                        : `${daysRemaining} days remaining`}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCreateAccount}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#c95375',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b34563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#c95375'}
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </button>
                
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#288896',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1f6b77'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#288896'}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>

                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

