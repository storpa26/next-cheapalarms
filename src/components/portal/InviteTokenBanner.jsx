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
    <div className="rounded-[32px] border-2 border-warning/50 bg-warning-bg p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-warning-bg p-3">
          <AlertCircle className="h-6 w-6 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Guest Access</h3>
          <p className="mt-1 text-sm text-foreground">
            You're viewing this estimate with a temporary invite link. For full access, create an account or sign in.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This link will expire after 7 days. Contact your specialist if you need a new one.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 text-muted-foreground transition hover:bg-warning-bg hover:text-foreground"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

