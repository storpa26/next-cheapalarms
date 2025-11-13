export function CardStat({ title, value, hint }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}


