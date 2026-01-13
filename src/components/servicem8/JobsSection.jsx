import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import JobDetailModal from "./JobDetailModal";

export default function JobsSection({ jobs, loading }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  const getStatusColor = (status) => {
    const colors = {
      "In Progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Scheduled": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Quote": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "Completed": "bg-green-500/10 text-green-600 border-green-500/20",
      "Cancelled": "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[status] || colors.Quote;
  };

  const getStatusIcon = (status) => {
    const icons = {
      "In Progress": "⚡",
      "Scheduled": "📅",
      "Quote": "📋",
      "Completed": "✅",
      "Cancelled": "❌",
    };
    return icons[status] || "📋";
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle>ServiceM8 Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          ServiceM8 Jobs
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {jobs.length} total jobs • {jobs.filter(j => j.status === "In Progress").length} in progress
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.uuid}
                onClick={() => handleJobClick(job)}
                className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-sm transition-all duration-300 cursor-pointer hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-mono font-semibold text-foreground">
                        {job.jobNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(job.status)} border font-medium`}
                      >
                        <span className="mr-1.5">{getStatusIcon(job.status)}</span>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {job.jobType} • {job.company}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-60">📍</span>
                        <span className="truncate max-w-[200px]">{job.address}</span>
                      </div>
                      {job.assignedTo && (
                        <div className="flex items-center gap-1.5">
                          <span className="opacity-60">👤</span>
                          <span>{job.assignedTo}</span>
                        </div>
                      )}
                      {job.startedAt && (
                        <div className="flex items-center gap-1.5">
                          <span className="opacity-60">⏱️</span>
                          <span>Started {job.startedAt}</span>
                        </div>
                      )}
                      {job.scheduledStartDate && (
                        <div className="flex items-center gap-1.5">
                          <span className="opacity-60">📅</span>
                          <span>
                            {new Date(job.scheduledStartDate).toLocaleDateString("en-AU", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                      {job.photos > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="opacity-60">📷</span>
                          <span>{job.photos} photos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <JobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </Card>
  );
}

