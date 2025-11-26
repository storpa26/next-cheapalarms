import Head from "next/head";
import { useState, useEffect } from "react";
import { ActiveJobs } from "@/components/activity/ActiveJobs";
import { WorkerStatus } from "@/components/activity/WorkerStatus";
import { CustomerActivity } from "@/components/activity/CustomerActivity";
import { RecentEvents } from "@/components/activity/RecentEvents";
import {
  generateActiveJobs,
  generateWorkerStatus,
  generateCustomerActivity,
  generateRecentEvents,
} from "@/lib/activity/mock-data";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [activeJobs, setActiveJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customerActivities, setCustomerActivities] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setActiveJobs(generateActiveJobs(8));
      setWorkers(generateWorkerStatus());
      setCustomerActivities(generateCustomerActivity(10));
      setRecentEvents(generateRecentEvents(8));
      setLoading(false);
    }, 800);
  }, []);

  return (
    <>
      <Head>
        <title>Operations Dashboard • CheapAlarms</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Operations Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Real-time view of jobs, workers, customers, and events
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <StatCard
              label="Active Jobs"
              value={activeJobs.length}
              icon="🔵"
              color="from-blue-500 to-blue-600"
              loading={loading}
            />
            <StatCard
              label="Workers Online"
              value={workers.filter(w => w.status === "online").length}
              icon="👷"
              color="from-green-500 to-green-600"
              loading={loading}
            />
            <StatCard
              label="Customer Activity"
              value={customerActivities.length}
              icon="👥"
              color="from-purple-500 to-purple-600"
              loading={loading}
            />
            <StatCard
              label="Recent Events"
              value={recentEvents.length}
              icon="📋"
              color="from-orange-500 to-orange-600"
              loading={loading}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-border/60 overflow-x-auto">
            {[
              { id: "jobs", label: "Active Jobs", count: activeJobs.length, icon: "🔵" },
              { id: "workers", label: "Workers", count: workers.filter(w => w.status === "online").length, icon: "👷" },
              { id: "customers", label: "Customers", count: customerActivities.length, icon: "👥" },
              { id: "events", label: "Events", count: recentEvents.length, icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative whitespace-nowrap px-6 py-3 text-sm font-medium transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`
                        rounded-full px-2 py-0.5 text-xs font-semibold
                        ${
                          activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6">
            {loading ? (
              <ActivityFeedSkeleton />
            ) : (
              <>
                {activeTab === "jobs" && (
                  <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🔵</span>
                        Active Jobs ({activeJobs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActiveJobs jobs={activeJobs} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "workers" && (
                  <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">👷</span>
                        Worker Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WorkerStatus workers={workers} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "customers" && (
                  <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        Customer Activity ({customerActivities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomerActivity activities={customerActivities} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "events" && (
                  <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Recent Events ({recentEvents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecentEvents events={recentEvents} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border border-border/60
        bg-card/60 backdrop-blur-sm p-6
        shadow-sm shadow-black/5
        transition-all duration-500
        hover:shadow-xl hover:shadow-black/20
        hover:scale-[1.02] hover:-translate-y-1
        transform-gpu will-change-transform
        animate-in fade-in slide-in-from-bottom-4
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {loading ? "—" : value}
          </p>
        </div>
        <div
          className={`
            h-14 w-14 rounded-xl bg-gradient-to-br ${color}
            flex items-center justify-center text-2xl
            shadow-lg transition-transform duration-300
            group-hover:scale-110 group-hover:rotate-3
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl bg-muted/40"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/activity"),
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

