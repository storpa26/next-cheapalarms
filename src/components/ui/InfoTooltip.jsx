import { useState } from "react";
import { Info } from "lucide-react";

export function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info className="h-4 w-4 text-primary" />
      {open ? (
        <div className="absolute left-1/2 top-7 z-20 w-52 -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 shadow-xl">
          {text}
        </div>
      ) : null}
    </div>
  );
}

