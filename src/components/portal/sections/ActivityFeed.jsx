import { Activity } from "lucide-react";

export function ActivityFeed({ entries }) {
  return (
    <div className="rounded-[28px] border border-border-subtle bg-background p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-2">
      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Activity feed</p>
      <h2 className="mt-2 text-lg font-semibold text-foreground">Real-time updates</h2>
      <div className="mt-4 space-y-4">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <div key={index} className="flex items-start gap-3 rounded-2xl bg-muted p-3">
              <Activity className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {entry.label || entry.title || "Update"}
                </p>
                <p className="text-xs text-muted-foreground">{entry.detail || entry.description || ""}</p>
              </div>
              {entry.time && <span className="text-xs text-muted-foreground">{entry.time}</span>}
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-muted p-3 text-center text-xs text-muted-foreground">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}

