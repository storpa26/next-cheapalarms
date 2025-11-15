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
}) {
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
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>${(item.priceExGst * item.quantity).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Base kit</span>
            <span>${baseKit.priceExGst.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Add-ons</span>
            <span>${totals.addonSubtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Services</span>
            <span>${totals.serviceSubtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-foreground">
            <span>Subtotal (ex GST)</span>
            <span>${totals.subtotalExGst.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>GST (15%)</span>
            <span>${totals.gstAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-foreground">
            <span>Total inc GST</span>
            <span>${totals.totalIncGst.toFixed(0)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Install time estimate: {(totals.installMinutes / 60).toFixed(1)} hrs
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={inCart}
          className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold ${
            inCart ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {inCart ? "Configuration saved" : "Add configuration"}
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

