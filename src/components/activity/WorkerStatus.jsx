import { Badge } from "@/components/ui/badge";

export function WorkerStatus({ workers }) {
  const onlineWorkers = workers.filter(w => w.status === "online");
  const offlineWorkers = workers.filter(w => w.status === "offline");

  return (
    <div className="space-y-4">
      {onlineWorkers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Online ({onlineWorkers.length})
          </h3>
          <div className="space-y-3">
            {onlineWorkers.map((worker, index) => (
              <WorkerCard key={worker.id} worker={worker} index={index} />
            ))}
          </div>
        </div>
      )}

      {offlineWorkers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Offline ({offlineWorkers.length})
          </h3>
          <div className="space-y-3">
            {offlineWorkers.map((worker, index) => (
              <WorkerCard key={worker.id} worker={worker} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkerCard({ worker, index }) {
  const isOnline = worker.status === "online";

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
        ${!isOnline ? "opacity-60" : ""}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center text-lg
                    ${isOnline ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}
                  `}
                >
                  {worker.name.charAt(0)}
                </div>
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {worker.name}
                  <Badge
                    variant={isOnline ? "default" : "outline"}
                    className={isOnline ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{worker.location}</p>
              </div>
            </div>

            {isOnline && (
              <div className="ml-13 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Logged in: {worker.hoursLoggedIn}</span>
                </div>

                {worker.assignedJobs > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>
                      {worker.assignedJobs} job{worker.assignedJobs > 1 ? "s" : ""} assigned
                      {worker.currentJob && ` • ${worker.currentJob}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

