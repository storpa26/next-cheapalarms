import { AlertCircle, CheckCircle2 } from "lucide-react";

function LimitMeter({ label, used, max }) {
  const percentage = Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span>
          {used}/{max}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function SummaryPanel({
  baseKit,
  selectedAddons,
  totals,
  limitUsage,
  onAddToCart,
  inCart,
  hasConfigChanged = false,
}) {
  // Determine button text and styling
  const getButtonState = () => {
    if (!inCart) {
      return {
        text: "Add configuration",
        className: "bg-primary text-white hover:bg-primary/90",
        disabled: false,
      };
    }
    
    if (hasConfigChanged) {
      return {
        text: "Update configuration",
        className: "bg-primary text-white hover:bg-primary/90",
        disabled: false,
      };
    }
    
    return {
      text: "Configuration saved",
      className: "bg-success text-success-foreground cursor-default",
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <aside className="space-y-6 lg:sticky lg:top-8">
      <div className="rounded-3xl border bg-white p-6 shadow-lg">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">Configuration</div>
        <h3 className="mt-1 text-2xl font-semibold text-foreground">Quote snapshot</h3>

        <div className="mt-5 space-y-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{baseKit.name}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {baseKit.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground">Add-ons</div>
            {selectedAddons.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No optional devices selected yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {selectedAddons.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <div className="text-xs text-muted-foreground">
            Install time estimate: {(totals.installMinutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Pricing will be provided in your personalized quote after we review your configuration.
          </div>
        </div>

        {/* Configuration Status Indicator */}
        {inCart && hasConfigChanged && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning-bg/50 p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-xs text-warning font-medium">
              Configuration has been modified
            </p>
          </div>
        )}

        {inCart && !hasConfigChanged && (
          <div className="mt-4 rounded-lg border border-success/30 bg-success-bg/50 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            <p className="text-xs text-success font-medium">
              Configuration saved
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onAddToCart}
          disabled={buttonState.disabled}
          className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${buttonState.className}`}
        >
          {buttonState.text}
        </button>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow">
        <div className="text-sm font-semibold text-foreground">System limits</div>
        <p className="text-xs text-muted-foreground">Hub 2 supports 200 devices & 1000 mA power budget.</p>
        <div className="mt-4 space-y-3">
          <LimitMeter label="Device slots" used={limitUsage.deviceSlots.used} max={limitUsage.deviceSlots.max} />
          <LimitMeter label="Power budget (mA)" used={limitUsage.power.used} max={limitUsage.power.max} />
          <LimitMeter label="Keypads" used={limitUsage.keypads.used} max={limitUsage.keypads.max} />
          <LimitMeter label="Sirens" used={limitUsage.sirens.used} max={limitUsage.sirens.max} />
        </div>
      </div>
    </aside>
  );
}

