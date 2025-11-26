import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function JobDetailModal({ job, open, onClose }) {
  if (!job) return null;

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="p-6">
          <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold">{job.jobNumber}</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(job.status)} border font-medium`}
              >
                <span className="mr-1.5">{getStatusIcon(job.status)}</span>
                {job.status}
              </Badge>
            </div>
          </div>
          <DialogTitle className="text-xl mt-4">{job.jobType} • {job.company}</DialogTitle>
          <DialogDescription>{job.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-6">
          {/* Job Details */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Job Type:</span>
                  <p className="font-medium text-foreground mt-1">{job.jobType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <p className="font-medium text-foreground mt-1">{job.company}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned To:</span>
                  <p className="font-medium text-foreground mt-1">
                    {job.assignedTo || "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium text-foreground mt-1">
                    {new Date(job.createdAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-foreground">📍 Location</h3>
              <p className="text-foreground">{job.address}</p>
            </CardContent>
          </Card>

          {/* Schedule */}
          {(job.scheduledStartDate || job.startedAt || job.completedAt) && (
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-foreground">⏰ Timeline</h3>
                <div className="space-y-3">
                  {job.scheduledStartDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Scheduled</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.scheduledStartDate).toLocaleString("en-AU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {job.scheduledEndDate && (
                            <> - {new Date(job.scheduledEndDate).toLocaleTimeString("en-AU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {job.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Started</p>
                        <p className="text-xs text-muted-foreground">{job.startedAt}</p>
                      </div>
                    </div>
                  )}
                  {job.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Completed</p>
                        <p className="text-xs text-muted-foreground">{job.completedAt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {job.photos > 0 && (
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-foreground">📷 Photos</h3>
                <p className="text-sm text-muted-foreground">{job.photos} photos attached</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {Array.from({ length: Math.min(job.photos, 6) }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center text-2xl"
                    >
                      📷
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {job.notes && (
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-foreground">📝 Notes</h3>
                <p className="text-sm text-foreground">{job.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-opacity hover:opacity-90">
              View in ServiceM8
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted">
              Edit Job
            </button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

