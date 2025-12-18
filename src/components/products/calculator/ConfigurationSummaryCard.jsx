import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfigurationSummaryCard({
  profile,
  addons,
  coverage,
  onEdit,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addonCount = addons.reduce((sum, addon) => sum + addon.quantity, 0);
  const coverageSummary = {
    doors: coverage.doors || 0,
    windows: coverage.windows || 0,
    motion: coverage.motion || 0,
  };

  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Configuration Saved</h3>
            <p className="text-xs text-muted-foreground">Your selections are ready</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1.5" />
            Edit
          </Button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Compact View (Always Visible) */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Profile</p>
          <p className="font-medium text-foreground">{profile?.title ?? "Custom"}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Add-ons</p>
          <p className="font-medium text-foreground">
            {addonCount} {addonCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Coverage</p>
          <p className="font-medium text-foreground">
            {coverageSummary.doors + coverageSummary.windows + coverageSummary.motion} zones
          </p>
        </div>
      </div>

      {/* Expanded View (Conditional) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Property Profile</p>
            <p className="text-sm text-foreground">{profile?.title ?? "Custom"}</p>
            {profile?.scopeGuide && (
              <p className="text-xs text-muted-foreground mt-1">{profile.scopeGuide}</p>
            )}
          </div>

          {addons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Selected Add-ons</p>
              <ul className="space-y-1">
                {addons.slice(0, 5).map((addon) => (
                  <li key={addon.id} className="text-sm text-foreground">
                    {addon.quantity} × {addon.name}
                  </li>
                ))}
                {addons.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    +{addons.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Coverage Details</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Doors</p>
                <p className="font-medium text-foreground">{coverageSummary.doors}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Windows</p>
                <p className="font-medium text-foreground">{coverageSummary.windows}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Motion</p>
                <p className="font-medium text-foreground">{coverageSummary.motion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

