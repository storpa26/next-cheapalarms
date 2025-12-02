import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function InviteTokenBanner({ onDismiss }) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="rounded-[32px] border-2 border-amber-200 bg-amber-50 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-amber-100 p-3">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Guest Access</h3>
          <p className="mt-1 text-sm text-slate-700">
            You're viewing this estimate with a temporary invite link. For full access, create an account or sign in.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            This link will expire after 7 days. Contact your specialist if you need a new one.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 text-slate-400 transition hover:bg-amber-100 hover:text-slate-600"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

