"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  count: {
    label: "Estimates",
    color: "hsl(var(--color-secondary))",
  },
  total: {
    label: "Value",
    color: "hsl(var(--color-secondary))",
  },
};

// Helper function to format dates consistently (SSR-safe)
function formatChartDate(dateStr) {
  const date = new Date(dateStr);
  // Use UTC methods to ensure consistency between server and client
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `${month} ${day}`;
}

export function EstimatesChart({ data, isLoading, error, range }) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item) => ({
      date: formatChartDate(item.date),
      fullDate: item.date,
      count: item.count || 0,
      total: item.total || 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Estimate Activity
          </CardTitle>
          <CardDescription>
            {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 3 months"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Estimate Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
            <p className="font-semibold">Failed to load chart data</p>
            {error?.message && (
              <p className="text-xs text-muted-foreground/70">{error.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Estimate Activity
          </CardTitle>
          <CardDescription>
            {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 3 months"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              Estimate Activity
            </CardTitle>
            <CardDescription className="mt-1">
              {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 3 months"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-secondary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--color-secondary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              style={{ fontSize: "12px", fill: "hsl(var(--color-muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              style={{ fontSize: "12px", fill: "hsl(var(--color-muted-foreground))" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const fullDate = payload[0].payload.fullDate;
                      const date = new Date(fullDate);
                      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const weekday = weekdays[date.getUTCDay()];
                      const month = months[date.getUTCMonth()];
                      const day = date.getUTCDate();
                      return `${weekday}, ${month} ${day}`;
                    }
                    return value;
                  }}
                  formatter={(value, name) => {
                    if (name === "total") {
                      // Format currency consistently (SSR-safe)
                      const formatted = Number(value).toFixed(2);
                      const parts = formatted.split(".");
                      const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      return [`$${integer}.${parts[1]}`, "Value"];
                    }
                    return [value, "Count"];
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--color-secondary))"
              strokeWidth={2}
              fill="url(#fillCount)"
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
