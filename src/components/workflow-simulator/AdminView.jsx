import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { computeUIState } from '@/lib/workflow-simulator/status-computer';

export function AdminView({ portalMeta, onAction, uiState }) {
  const computed = uiState || computeUIState(portalMeta);
  
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const workflow = portalMeta.workflow || {};
  const invoice = portalMeta.invoice || {};
  
  const isAccepted = workflow.status === 'accepted' || quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  
  // Determine current admin task
  const getAdminTask = () => {
    if (!workflow.status || workflow.status === 'requested') {
      return 'Send estimate to customer';
    }
    if (workflow.status !== 'requested' && quote.photos_required && photos.submission_status === 'submitted' && !photos.reviewed) {
      return 'Review photos and enable acceptance';
    }
    if (workflow.status !== 'requested' && !quote.photos_required && !quote.acceptance_enabled) {
      return 'Enable acceptance (no photos required)';
    }
    if (quote.acceptance_enabled && !isAccepted) {
      return 'Waiting for customer to accept';
    }
    if (isAccepted && invoice?.status === 'created' && (invoice.balance || 0) > 0) {
      return 'Waiting for payment';
    }
    if (invoice?.status === 'paid') {
      return 'Invoice paid - ready for installation';
    }
    return 'No action required';
  };
  
  return (
    <Card className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Admin View</h2>
      
      {/* Current Admin Task Banner */}
      <div className="mb-6 p-4 rounded-lg bg-info/10 border border-info/30">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-info" />
          <span className="text-sm font-medium text-info">Current Task:</span>
        </div>
        <p className="text-sm text-foreground">{getAdminTask()}</p>
      </div>
      
      {/* Admin Controls */}
      <div className="space-y-4">
        {/* Photos Required Toggle */}
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm">Photos Required</h3>
              <p className="text-xs text-muted-foreground">
                {quote.photos_required
                  ? 'Customer must upload photos before acceptance can be enabled.'
                  : 'No photos required. You can enable acceptance immediately.'}
              </p>
            </div>
            <Switch
              checked={quote.photos_required ?? true}
              onCheckedChange={(checked) => onAction('toggle-photos-required', { photos_required: checked })}
              disabled={isAccepted || isRejected}
            />
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Admin Actions:</h3>
          
          {/* Enable Acceptance (no photos) */}
          {computed.adminCanEnableAcceptance && (
            <Button
              onClick={() => onAction('enable-acceptance')}
              variant="gradient"
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Enable Acceptance (No Photos Required)
            </Button>
          )}
          
          {/* Approve & Enable (with photos) */}
          {computed.adminCanApproveAndEnable && (
            <Button
              onClick={() => onAction('approve-and-enable')}
              variant="gradient"
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Photos & Enable Acceptance
            </Button>
          )}
          
          {/* Request Changes (with photos) */}
          {computed.adminCanRequestChanges && (
            <Button
              onClick={() => onAction('request-changes')}
              variant="outline"
              className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Request Changes / More Photos
            </Button>
          )}
          
          {/* No actions available message */}
          {!computed.adminCanEnableAcceptance && !computed.adminCanApproveAndEnable && !computed.adminCanRequestChanges && (
            <div className="p-4 rounded-lg border border-info/30 bg-info/10">
              <p className="text-xs text-muted-foreground">
                {!quote.sentAt
                  ? 'Estimate will be automatically sent when customer requests quote.'
                  : quote.photos_required === null
                  ? 'Set "Photos Required" toggle above, then wait for customer to upload/submit photos.'
                  : quote.photos_required && photos.submission_status !== 'submitted'
                  ? 'Waiting for customer to upload and submit photos.'
                  : quote.acceptance_enabled
                  ? 'Acceptance is enabled. Waiting for customer to accept.'
                  : 'No actions available at this time.'}
              </p>
            </div>
          )}
        </div>
        
        {/* Status Indicators */}
        <div className="p-4 rounded-lg border border-border bg-muted">
          <h4 className="font-semibold mb-2 text-sm">Current Status:</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Workflow:</span>
              <Badge variant="outline">{workflow.status || 'null'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Acceptance Enabled:</span>
              <Badge variant={quote.acceptance_enabled ? 'default' : 'secondary'}>
                {quote.acceptance_enabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            {quote.photos_required && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Photos Submitted:</span>
                  <Badge variant={photos.submission_status === 'submitted' ? 'default' : 'secondary'}>
                    {photos.submission_status === 'submitted' ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Photos Reviewed:</span>
                  <Badge variant={photos.reviewed ? 'default' : 'secondary'}>
                    {photos.reviewed ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </>
            )}
            {invoice.id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice Status:</span>
                <Badge variant="outline">{invoice.status || 'created'}</Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Availability Explanation */}
        <div className="p-4 rounded-lg border border-info/30 bg-info/10">
          <h4 className="font-semibold mb-2 text-sm">Available Actions:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            {computed.adminCanEnableAcceptance && (
              <li>✅ You can "Enable Acceptance" (photos not required)</li>
            )}
            {computed.adminCanApproveAndEnable && (
              <li>✅ You can "Approve Photos & Enable Acceptance"</li>
            )}
            {quote.photos_required && photos.submission_status !== 'submitted' && (
              <li>⏳ Waiting for customer to submit photos...</li>
            )}
            {quote.acceptance_enabled && !isAccepted && (
              <li>✅ Acceptance enabled. Customer can now accept.</li>
            )}
            {isAccepted && (
              <li>✅ Customer accepted. Invoice {invoice.id ? 'created automatically' : 'pending'}.</li>
            )}
            {quote.sentAt && (
              <li>ℹ️ Estimate was automatically sent when customer requested quote.</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}


