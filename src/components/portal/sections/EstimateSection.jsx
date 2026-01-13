import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { badgeVariant } from "../utils/portal-utils";
import { Detail } from "../utils/Detail";
import { formatDate } from "../utils/portal-utils";
import { memo } from "react";

export const EstimateSection = memo(function EstimateSection({ view }) {
  return (
    <div className="space-y-6">
      <EstimateCard view={view} />
    </div>
  );
});

function EstimateCard({ view }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Estimate</CardTitle>
          <CardDescription>Estimate {view.estimateId ?? "—"}</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.quote.status)}>{view.quote.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Quote number" value={view.quote.number} />
        <Detail label="Next step" value={view.nextStep} />
        <Detail label="Accepted on" value={formatDate(view.quote.acceptedAt)} />
      </CardContent>
    </Card>
  );
}

