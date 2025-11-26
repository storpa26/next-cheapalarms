import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkerDetailModal from "./WorkerDetailModal";

export default function WorkersSection({ workers, loading }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle>ServiceM8 Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const onlineWorkers = workers.filter(w => w.status === "online");
  const offlineWorkers = workers.filter(w => w.status === "offline");

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          ServiceM8 Workers
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {onlineWorkers.length} online • {offlineWorkers.length} offline
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Online Workers */}
          {onlineWorkers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Online
              </h3>
              <div className="space-y-3">
                {onlineWorkers.map((worker) => (
                  <div
                    key={worker.uuid}
                    onClick={() => handleWorkerClick(worker)}
                    className="p-4 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-background shadow-sm cursor-pointer hover:border-green-500/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{worker.name}</h4>
                          <p className="text-xs text-muted-foreground">{worker.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Online
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="opacity-60">⏱️</span>
                        <span className="text-muted-foreground">
                          {worker.hoursLoggedToday} today
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="opacity-60">📋</span>
                        <span className="text-muted-foreground">
                          {worker.assignedJobs} jobs
                        </span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="opacity-60">📍</span>
                        <span className="text-muted-foreground truncate">
                          {worker.currentLocation}
                        </span>
                      </div>
                      {worker.jobType && (
                        <div className="flex items-center gap-2 col-span-2">
                          <span className="opacity-60">🔧</span>
                          <span className="text-muted-foreground">
                            {worker.jobType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Workers */}
          {offlineWorkers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Offline
              </h3>
              <div className="space-y-3">
                {offlineWorkers.map((worker) => (
                  <div
                    key={worker.uuid}
                    onClick={() => handleWorkerClick(worker)}
                    className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-muted/20 to-background shadow-sm opacity-60 cursor-pointer hover:opacity-80 hover:border-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground font-semibold">
                          {worker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{worker.name}</h4>
                          <p className="text-xs text-muted-foreground">{worker.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Offline
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <WorkerDetailModal
        worker={selectedWorker}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorker(null);
        }}
      />
    </Card>
  );
}

