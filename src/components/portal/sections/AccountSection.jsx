import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { badgeVariant, formatDate } from "@/components/portal/utils/portal-utils";
import { Detail } from "@/components/portal/utils/Detail";

export function PortalAccountCard({ view }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Portal access</CardTitle>
          <CardDescription>Manage customer access to the dashboard.</CardDescription>
        </div>
        <Badge variant={badgeVariant(view.account.status)}>{view.account.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Detail label="Invite last sent" value={formatDate(view.account.lastInviteAt)} />
        <Detail label="Invite expires" value={formatDate(view.account.expiresAt)} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            disabled={!view.account.portalUrl}
            asChild={Boolean(view.account.portalUrl)}
          >
            {view.account.portalUrl ? (
              <a href={view.account.portalUrl} target="_blank" rel="noreferrer">
                Open portal
              </a>
            ) : (
              <span>Portal link unavailable</span>
            )}
          </Button>
          {view.account.resetUrl ? (
            <Button variant="ghost" asChild>
              <a href={view.account.resetUrl} target="_blank" rel="noreferrer">
                Password reset link
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account preferences</CardTitle>
        <CardDescription>Manage how we stay in touch with you.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Security</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Button variant="outline" size="sm" disabled>
              Reset password
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Two-factor (coming soon)
            </Button>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Notifications</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="size-4 rounded border-border" />
              Email updates
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="size-4 rounded border-border" />
              SMS reminders
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" readOnly className="size-4 rounded border-border" />
              Push notifications
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FAQSection() {
  return (
    <Card className="bg-muted/30 text-sm text-muted-foreground">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Need a hand?</CardTitle>
        <CardDescription>
          These are the questions customers ask most often. We'll add more over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <details className="rounded border border-border bg-background p-3">
          <summary className="cursor-pointer text-foreground">How do I reschedule?</summary>
          <p className="mt-2">
            Click "Request a call" and let us know your preferred date—we'll get back to you within the
            hour.
          </p>
        </details>
        <details className="rounded border border-border bg-background p-3">
          <summary className="cursor-pointer text-foreground">What photos do you need?</summary>
          <p className="mt-2">
            At minimum we need wide shots of the ceiling, any existing detectors, and the meter box.
          </p>
        </details>
      </CardContent>
    </Card>
  );
}

