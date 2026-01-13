import { Badge } from "../ui/badge";

const priorityColors = {
  high: "from-red-500 to-red-600",
  medium: "from-yellow-500 to-yellow-600",
  low: "from-gray-500 to-gray-600",
};

export function RecentEvents({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6">
        <p className="text-sm text-muted-foreground">No recent events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <EventCard key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

function EventCard({ event, index }) {
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
        ${event.priority === "high" ? "border-red-500/20" : ""}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{event.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  {event.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <span>{event.relativeTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

