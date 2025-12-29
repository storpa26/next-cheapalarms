import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Upload, CreditCard, AlertCircle } from 'lucide-react';
import { getDisplayStatus, getStatusMessage, computeUIState } from '@/lib/workflow-simulator/status-computer';
import { NextStepCard } from './NextStepCard';

export function CustomerView({ portalMeta, onAction, uiState }) {
  const displayStatus = uiState?.displayStatus || getDisplayStatus(portalMeta);
  const statusMessage = uiState?.statusMessage || getStatusMessage(displayStatus);
  const computed = uiState || computeUIState(portalMeta);
  
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const invoice = portalMeta.invoice || {};
  const workflow = portalMeta.workflow || {};
  
  const isAccepted = workflow.status === 'accepted' || quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  
  return (
    <Card className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Customer View</h2>
      
      {/* Next Step Card */}
      <div className="mb-6">
        <NextStepCard portalMeta={portalMeta} onAction={onAction} uiState={uiState} />
      </div>
      
      {/* Current Step Banner */}
      <div className="mb-6 p-4 rounded-lg bg-muted border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Current Step:</span>
          <Badge variant="outline" className="text-base px-3 py-1">
            {displayStatus.replace(/_/g, ' ')}
          </Badge>
        </div>
        <p className="text-sm text-foreground mt-2">{statusMessage}</p>
        {(invoice?.balance > 0) && invoice?.status === 'part_paid' && (
          <p className="text-sm font-medium text-warning mt-1">
            Remaining balance: ${invoice.balance}
          </p>
        )}
      </div>
      
      {/* Status Explanation */}
      <div className="mb-6 p-4 rounded-lg border border-border bg-background">
        <h3 className="font-semibold mb-2 text-sm">What This Means:</h3>
        <ul className="text-xs space-y-1 text-muted-foreground">
          {displayStatus === 'QUOTE_REQUESTED' && (
            <>
              <li>• Quote was just requested</li>
              <li>• Admin hasn't sent estimate yet</li>
              <li>• Waiting for admin action</li>
            </>
          )}
          {displayStatus === 'ESTIMATE_SENT' && (
            <>
              <li>• Estimate has been sent</li>
              <li>• Upload photos (if required) then click "Request Review"</li>
              <li>• Acceptance will be enabled after admin review</li>
            </>
          )}
          {displayStatus === 'PHOTOS_UPLOADED' && (
            <>
              <li>• Photos have been uploaded</li>
              <li>• Click "Request Review" to submit for admin review</li>
              <li>• Admin will review and enable acceptance</li>
            </>
          )}
          {displayStatus === 'UNDER_REVIEW' && (
            <>
              <li>• Review request submitted</li>
              <li>• Admin is reviewing your photos/request</li>
              <li>• You'll be notified when acceptance is enabled</li>
            </>
          )}
          {displayStatus === 'AWAITING_PHOTOS' && (
            <>
              <li>• Admin sent estimate</li>
              <li>• Photos are REQUIRED</li>
              <li>• Customer must upload photos first</li>
              <li>• Accept button is HIDDEN</li>
            </>
          )}
          {displayStatus === 'PHOTOS_UNDER_REVIEW' && (
            <>
              <li>• Customer submitted photos</li>
              <li>• Admin hasn't reviewed yet</li>
              <li>• Accept button is HIDDEN</li>
            </>
          )}
          {displayStatus === 'CHANGES_REQUESTED' && (
            <>
              <li>• Admin reviewed photos</li>
              <li>• Changes or more photos requested</li>
              <li>• Customer can resubmit photos</li>
              <li>• Accept button is HIDDEN</li>
            </>
          )}
          {displayStatus === 'READY_TO_ACCEPT' && (
            <>
              <li>• Admin enabled acceptance</li>
              <li>• Photos reviewed (if required)</li>
              <li>• Accept button is VISIBLE ✅</li>
            </>
          )}
          {displayStatus === 'ACCEPTED' && (
            <>
              <li>• Customer accepted estimate</li>
              <li>• Invoice is being created...</li>
            </>
          )}
          {displayStatus === 'INVOICE_CREATED' && (
            <>
              <li>• Invoice created</li>
              <li>• Ready for payment</li>
            </>
          )}
          {displayStatus === 'PART_PAID' && (
            <>
              <li>• Partial payment received</li>
              <li>• Balance remaining: ${invoice.balance}</li>
            </>
          )}
          {displayStatus === 'PAID' && (
            <>
              <li>• Invoice fully paid</li>
              <li>• Installation can be scheduled</li>
            </>
          )}
          {displayStatus === 'REJECTED' && (
            <>
              <li>• Estimate has been rejected</li>
              <li>• No further actions available</li>
            </>
          )}
        </ul>
      </div>
      
      {/* Customer Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Customer Actions:</h3>
        
        {/* Request Quote */}
        {!workflow.status && (
          <Button
            onClick={() => onAction('request-quote')}
            variant="default"
            className="w-full"
          >
            Request Quote
          </Button>
        )}
        
        {/* Request Review */}
        {computed.canRequestReview && (
          <Button
            onClick={() => onAction('request-review')}
            variant="default"
            className="w-full"
          >
            Request Review
          </Button>
        )}
        
        {/* Upload Photos */}
        {computed.canUploadPhotos && (
          <Button
            onClick={() => onAction('upload-photos')}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        )}
        
        {/* Submit Photos */}
        {computed.canSubmitPhotos && (
          <Button
            onClick={() => onAction('submit-photos')}
            variant="default"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Submit Photos for Review
          </Button>
        )}
        
        {/* Accept Estimate */}
        {computed.canAccept && (
          <Button
            onClick={() => onAction('accept')}
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept Estimate
          </Button>
        )}
        
        {/* Pay Invoice */}
        {computed.canPay && (
          <div className="space-y-2">
            <Button
              onClick={() => onAction('pay-partial', { amount: 200 })}
              variant="outline"
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay $200 (Partial)
            </Button>
            <Button
              onClick={() => onAction('pay-full')}
              variant="default"
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Full Amount (${invoice?.balance || 0})
            </Button>
          </div>
        )}
        
        {/* Waiting Message */}
        {!computed.canAccept && !isAccepted && !isRejected && !computed.canUploadPhotos && !computed.canSubmitPhotos && !computed.canPay && workflow.status && (
          <div className="p-4 rounded-lg border border-warning/30 bg-warning/10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium text-warning">Waiting for admin...</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {quote.photos_required === null
                ? 'Admin needs to set whether photos are required. Use the toggle in Admin View.'
                : quote.photos_required && photos.submission_status !== 'submitted'
                ? 'Please upload and submit photos first.'
                : quote.photos_required && !photos.reviewed
                ? 'Photos are under review.'
                : 'Admin will enable acceptance when ready.'}
            </p>
          </div>
        )}
        
        {/* No actions available - show helpful message */}
        {!workflow.status && !computed.canUploadPhotos && !computed.canSubmitPhotos && !computed.canAccept && !computed.canPay && (
          <div className="p-4 rounded-lg border border-info/30 bg-info/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-info" />
              <p className="text-sm font-medium text-info">Ready to Start</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click "Request Quote" above to start the workflow. The estimate will be automatically created and sent to your email.
            </p>
          </div>
        )}
        
        {/* Legacy state warning - suggest reset */}
        {workflow.status === 'requested' && !quote.sentAt && (
          <div className="p-4 rounded-lg border border-amber/30 bg-amber/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-amber" />
              <p className="text-sm font-medium text-amber">Legacy State Detected</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              You're in an old state. Click "Reset to Beginning" or "Load Scenario" to start fresh with the new auto-send feature.
            </p>
          </div>
        )}
        
        {/* Already Accepted */}
        {isAccepted && (
          <div className="p-4 rounded-lg border border-success/30 bg-success/10">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-success">Estimate Accepted</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {invoice.id ? 'Invoice created. Ready for payment.' : 'Invoice is being created...'}
            </p>
          </div>
        )}
        
        {/* Rejected */}
        {isRejected && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Estimate Rejected</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This estimate has been rejected.
            </p>
          </div>
        )}
      </div>
      
      {/* Notifications Panel */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted">
        <h3 className="font-semibold mb-2 text-sm">Notifications:</h3>
        <div className="space-y-2 text-xs">
          {quote.sentAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Estimate sent on {new Date(quote.sentAt).toLocaleString()}</span>
            </div>
          )}
          {photos.submitted_at && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Photos submitted on {new Date(photos.submitted_at).toLocaleString()}</span>
            </div>
          )}
          {photos.reviewed_at && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Photos reviewed on {new Date(photos.reviewed_at).toLocaleString()}</span>
            </div>
          )}
          {quote.enabled_at && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Acceptance enabled on {new Date(quote.enabled_at).toLocaleString()}</span>
            </div>
          )}
          {quote.acceptedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Estimate accepted on {new Date(quote.acceptedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

