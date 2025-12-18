import { CheckCircle } from "lucide-react";

export function MissionSteps({ steps }) {
  return (
    <div className="rounded-[28px] border border-border-subtle bg-background p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Mission steps</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Operations status</h2>
        </div>
        <p className="text-xs text-muted-foreground">Auto-updates as tasks complete</p>
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`flex items-center justify-between rounded-2xl border border-border-subtle px-4 py-3 ${
              step.done ? "border-primary/30 bg-primary/5" : "bg-muted"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.caption}</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.done ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {step.done ? <CheckCircle className="h-4 w-4" /> : (
                <span className="text-xs font-semibold">{index + 1}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

