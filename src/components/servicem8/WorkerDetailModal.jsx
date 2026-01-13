import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export default function WorkerDetailModal({ worker, open, onClose }) {
  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="p-6">
          <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                worker.status === "online" 
                  ? "from-green-500 to-emerald-600" 
                  : "from-muted to-muted/50"
              } flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {worker.name.split(' ').map(n => n[0]).join('')}
              </div>
              {worker.status === "online" && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background"></div>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl">{worker.name}</DialogTitle>
              <DialogDescription>
                <Badge 
                  variant="outline" 
                  className={`mt-2 ${
                    worker.status === "online" 
                      ? "bg-green-500/10 text-green-600 border-green-500/20" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {worker.status === "online" ? "🟢 Online" : "⚫ Offline"}
                </Badge>
              </DialogDescription>
            </div>
          </div>
          </DialogHeader>

          <div className="space-y-6 pt-6">
          {/* Contact Info */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground mt-1">{worker.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium text-foreground mt-1">{worker.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Activity */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Status & Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium text-foreground mt-1 capitalize">{worker.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Clocked In:</span>
                  <p className="font-medium text-foreground mt-1">
                    {worker.clockedIn ? "Yes" : "No"}
                  </p>
                </div>
                {worker.clockedInAt && (
                  <div>
                    <span className="text-muted-foreground">Clocked In At:</span>
                    <p className="font-medium text-foreground mt-1">
                      {new Date(worker.clockedInAt).toLocaleString("en-AU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Hours Today:</span>
                  <p className="font-medium text-foreground mt-1">{worker.hoursLoggedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Work */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Current Work</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Assigned Jobs:</span>
                  <p className="font-medium text-foreground mt-1">{worker.assignedJobs} job(s)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Location:</span>
                  <p className="font-medium text-foreground mt-1">{worker.currentLocation}</p>
                </div>
                {worker.jobType && (
                  <div>
                    <span className="text-muted-foreground">Current Job Type:</span>
                    <p className="font-medium text-foreground mt-1">{worker.jobType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">{worker.assignedJobs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active Jobs</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">{worker.hoursLoggedToday}</p>
                  <p className="text-xs text-muted-foreground mt-1">Hours Today</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">
                    {worker.status === "online" ? "🟢" : "⚫"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-opacity hover:opacity-90">
              View in ServiceM8
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted">
              Send Message
            </button>
            {worker.status === "online" && (
              <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted">
                View Location
              </button>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

