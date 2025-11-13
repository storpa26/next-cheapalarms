export function ActivityList({ items = [] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-foreground">Recent activity</p>
      <div className="space-y-3 text-sm text-muted-foreground">
        {items.length ? (
          items.map((ev, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-foreground">{ev.title}</p>
                {ev.description ? <p className="text-xs">{ev.description}</p> : null}
              </div>
              <span className="text-xs">{ev.when}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        )}
      </div>
    </div>
  );
}


