import { CheckCircle } from "lucide-react";

export function MissionSteps({ steps }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mission steps</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Operations status</h2>
        </div>
        <p className="text-xs text-slate-500">Auto-updates as tasks complete</p>
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 ${
              step.done ? "border-primary/30 bg-primary/5" : "bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{step.label}</p>
              <p className="text-xs text-slate-500">{step.caption}</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.done ? "border-primary text-primary" : "border-slate-200 text-slate-400"
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

