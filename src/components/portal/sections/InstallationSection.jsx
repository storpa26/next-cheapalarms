import { memo } from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { badgeVariant, formatDate } from "../utils/portal-utils";
import { Detail } from "../utils/Detail";

function InstallationTimeline({ timeline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation timeline</CardTitle>
        <CardDescription>A quick look at what's happened and what's next.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4 text-sm text-muted-foreground">
          {timeline.map((step) => (
            <li key={step.id} className="flex items-start gap-3">
              <div
                className={`mt-1 size-2 rounded-full ${
                  step.complete ? "bg-secondary" : "bg-border"
                }`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4 text-foreground">
                  <span className="font-medium">{step.title}</span>
                  {step.when ? (
                    <span className="text-xs text-muted-foreground">{formatDate(step.when)}</span>
                  ) : null}
                </div>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function InstallationSummaryCard({ view }) {
  const scheduleLabel = view.installation?.scheduledFor
    ? formatDate(view.installation.scheduledFor)
    : "Not yet scheduled";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Installation</CardTitle>
          <CardDescription>{view.installation.message ?? "Scheduling details"}</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.installation.status)}>{view.installation.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Scheduled for" value={scheduleLabel} />
        <Detail label="Ready to schedule" value={view.installation.canSchedule ? "Yes" : "No"} />
      </CardContent>
    </Card>
  );
}

export const InstallationSection = memo(function InstallationSection({ view, timeline }) {
  return (
    <div className="space-y-6">
      <InstallationSummaryCard view={view} />
      <InstallationTimeline timeline={timeline} />
    </div>
  );
});

