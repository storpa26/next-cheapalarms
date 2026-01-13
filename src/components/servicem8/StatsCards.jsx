import { Card, CardContent } from "../ui/card";

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
            <CardContent className="p-6">
              <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: "⚡",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Workers Online",
      value: stats.onlineWorkers,
      icon: "👥",
      gradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: "📋",
      gradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      label: "Companies",
      value: stats.totalCompanies,
      icon: "🏢",
      gradient: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card
          key={index}
          className={`bg-card/80 backdrop-blur-md border ${stat.borderColor} shadow-xl relative overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

