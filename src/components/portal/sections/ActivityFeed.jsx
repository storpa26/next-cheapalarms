import { Activity, FileEdit, TrendingDown } from "lucide-react";

// Get icon and styling based on entry type and content
function getEntryStyle(entry) {
  const label = entry.label || '';
  const isSavings = label.includes('Savings');
  const isRevision = entry.type === 'revision';
  
  if (isRevision) {
    if (isSavings) {
      return {
        icon: TrendingDown,
        iconClass: 'text-success',
        bgClass: 'bg-success/10 border border-success/20',
        labelClass: 'text-success',
      };
    }
    return {
      icon: FileEdit,
      iconClass: 'text-primary',
      bgClass: 'bg-muted',
      labelClass: 'text-foreground',
    };
  }
  
  return {
    icon: Activity,
    iconClass: 'text-primary',
    bgClass: 'bg-muted',
    labelClass: 'text-foreground',
  };
}

export function ActivityFeed({ entries }) {
  return (
    <div className="rounded-[28px] border border-border-subtle bg-background p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] lg:col-span-2">
      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Activity feed</p>
      <h2 className="mt-2 text-lg font-semibold text-foreground">Real-time updates</h2>
      <div className="mt-4 space-y-4">
        {entries.length > 0 ? (
          entries.map((entry, index) => {
            const style = getEntryStyle(entry);
            const Icon = style.icon;
            
            return (
              <div key={entry.revisionId || index} className={`flex items-start gap-3 rounded-2xl p-3 ${style.bgClass}`}>
                <Icon className={`h-4 w-4 mt-0.5 ${style.iconClass}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${style.labelClass}`}>
                    {entry.label || entry.title || "Update"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 break-words">
                    {entry.detail || entry.description || ""}
                  </p>
                </div>
                {entry.time && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {entry.time}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-muted p-3 text-center text-xs text-muted-foreground">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}

