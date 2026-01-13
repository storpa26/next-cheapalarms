import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { formatDate } from "../utils/portal-utils";

export const ActivitySection = memo(function ActivitySection({ entries }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity log</CardTitle>
        <CardDescription>Everything that's happened so far.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {entries.length ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
            >
              <div>
                <p className="font-medium text-foreground">{entry.title}</p>
                <p>{entry.description}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(entry.when)}</span>
            </div>
          ))
        ) : (
          <p>No activity recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
});

