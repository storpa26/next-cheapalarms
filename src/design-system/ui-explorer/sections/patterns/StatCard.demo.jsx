import * as React from "react"
import { StatCard } from "@/components/ui/stat-card"
import { Grid } from "@/components/ui/grid"
import { Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

export default function StatCardDemo() {
  return (
    <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap={4}>
      <StatCard
        title="Total Users"
        value="1,234"
        description="+12% from last month"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Revenue"
        value="$45,678"
        description="+8% from last month"
        icon={<DollarSign className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="Growth"
        value="23.5%"
        description="+2.3% from last month"
        icon={<TrendingUp className="h-4 w-4" />}
        variant="info"
      />
      <StatCard
        title="Alerts"
        value="5"
        description="Requires attention"
        icon={<AlertCircle className="h-4 w-4" />}
        variant="warning"
      />
    </Grid>
  )
}

