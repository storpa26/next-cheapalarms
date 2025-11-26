export function CustomerActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6">
        <p className="text-sm text-muted-foreground">No customer activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <ActivityCard key={activity.id} activity={activity} index={index} />
      ))}
    </div>
  );
}

function ActivityCard({ activity, index }) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border transition-all duration-500 ease-out
        border-border/60 bg-card/60 backdrop-blur-sm
        shadow-sm shadow-black/5
        hover:shadow-xl hover:shadow-black/20
        hover:scale-[1.01] hover:-translate-y-0.5
        transform-gpu will-change-transform
        animate-in fade-in slide-in-from-left-4
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{activity.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground">{activity.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <span>{activity.relativeTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

