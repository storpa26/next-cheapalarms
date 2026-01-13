import { Badge } from "../ui/badge";

const statusColors = {
  "In Progress": "from-blue-500 to-blue-600",
  "Scheduled": "from-yellow-500 to-yellow-600",
  "Quote": "from-gray-500 to-gray-600",
};

const statusIcons = {
  "In Progress": "🔵",
  "Scheduled": "🟡",
  "Quote": "⚪",
};

export function ActiveJobs({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6">
        <p className="text-sm text-muted-foreground">No active jobs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} index={index} />
      ))}
    </div>
  );
}

function JobCard({ job, index }) {
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
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{statusIcons[job.status]}</span>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {job.jobNumber}
                  <Badge
                    variant="outline"
                    className={`
                      border-current/20 bg-gradient-to-r ${statusColors[job.status]} bg-clip-text text-transparent
                      font-medium text-xs
                    `}
                  >
                    {job.status}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
              </div>
            </div>

            <div className="ml-11 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.address}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-foreground">{job.worker}</span>
                {job.customer && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>Customer: {job.customer}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
            {job.startedAgo && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Started {job.startedAgo}</span>
              </div>
            )}
            {job.scheduledTime && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{job.scheduledTime}</span>
              </div>
            )}
            {job.estimatedDuration && (
              <span className="text-xs">Est. {job.estimatedDuration}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

