import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2, Clock, Upload, User, Shield } from 'lucide-react';

/**
 * NextStepCard Component
 * Shows the current step and what the customer should do next
 */
export function NextStepCard({ portalMeta, onAction, uiState }) {
  const workflow = portalMeta.workflow || {};
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const invoice = portalMeta.invoice || {};
  
  const getNextStepInfo = () => {
    // Rejected
    if (quote.status === 'rejected') {
      return {
        title: 'Estimate Rejected',
        message: 'This estimate has been rejected. No further actions are available.',
        action: null,
        actionText: null,
        responsible: 'customer',
        icon: AlertCircle,
        variant: 'destructive',
      };
    }
    
    // Quote requested but not sent
    if (!workflow.status || workflow.status === 'requested') {
      return {
        title: 'Quote Requested',
        message: 'Your quote request has been received. The estimate will be automatically created and sent.',
        action: null,
        actionText: null,
        responsible: 'system',
        icon: Clock,
        variant: 'info',
      };
    }
    
    // Estimate sent, photos required but not uploaded
    if (workflow.status === 'sent' && quote.photos_required && (photos.uploaded || 0) === 0) {
      return {
        title: 'Photos Required',
        message: 'Please upload installation photos first, then request review.',
        action: 'upload-photos',
        actionText: 'Upload Photos',
        responsible: 'customer',
        icon: Upload,
        variant: 'default',
      };
    }
    
    // Photos uploaded, ready to request review
    if (workflow.status === 'sent' && quote.photos_required && (photos.uploaded || 0) > 0 && !quote.approval_requested) {
      return {
        title: 'Photos Uploaded',
        message: 'Photos uploaded. Click "Request Review" to submit for admin review.',
        action: 'request-review',
        actionText: 'Request Review',
        responsible: 'customer',
        icon: User,
        variant: 'default',
      };
    }
    
    // No photos required, can request review immediately
    if (workflow.status === 'sent' && !quote.photos_required && !quote.approval_requested) {
      return {
        title: 'Estimate Ready',
        message: 'Your estimate has been sent. Click "Request Review" when you\'re ready to proceed.',
        action: 'request-review',
        actionText: 'Request Review',
        responsible: 'customer',
        icon: User,
        variant: 'default',
      };
    }
    
    // Review requested, photos required but not submitted
    if (workflow.status === 'under_review' && quote.photos_required && photos.submission_status !== 'submitted') {
      return {
        title: 'Photos Required',
        message: 'Upload installation photos to complete your approval request.',
        action: 'upload-photos',
        actionText: 'Upload Photos',
        responsible: 'customer',
        icon: Upload,
        variant: 'default',
      };
    }
    
    // Photos submitted but not reviewed
    if (workflow.status === 'under_review' && quote.photos_required && photos.submission_status === 'submitted' && !photos.reviewed) {
      return {
        title: 'Under Review',
        message: 'Your photos have been submitted. We\'re reviewing them and will notify you when acceptance is enabled.',
        action: null,
        actionText: null,
        responsible: 'admin',
        icon: Shield,
        variant: 'info',
      };
    }
    
    // Photos reviewed but changes requested
    if (workflow.status === 'under_review' && quote.photos_required && photos.submission_status === 'submitted' && photos.reviewed && !quote.acceptance_enabled) {
      return {
        title: 'Changes Requested',
        message: 'We\'ve reviewed your photos and need some changes or additional photos. Please resubmit.',
        action: 'upload-photos',
        actionText: 'Resubmit Photos',
        responsible: 'customer',
        icon: AlertCircle,
        variant: 'warning',
      };
    }
    
    // Review requested, no photos required, waiting for admin
    if (workflow.status === 'under_review' && !quote.photos_required && !quote.acceptance_enabled) {
      return {
        title: 'Under Review',
        message: 'Your review request is being processed. We\'ll notify you when acceptance is enabled.',
        action: null,
        actionText: null,
        responsible: 'admin',
        icon: Shield,
        variant: 'info',
      };
    }
    
    // Ready to accept
    if (workflow.status === 'ready_to_accept' && quote.acceptance_enabled) {
      return {
        title: 'Approved',
        message: 'Your estimate has been approved. You can now accept it and receive your invoice.',
        action: 'accept',
        actionText: 'Accept Estimate',
        responsible: 'customer',
        icon: CheckCircle2,
        variant: 'success',
      };
    }
    
    // Accepted, invoice created
    if (workflow.status === 'accepted' && invoice.id) {
      if (invoice.status === 'paid') {
        return {
          title: 'Payment Complete',
          message: 'Invoice fully paid. Installation can be scheduled.',
          action: null,
          actionText: null,
          responsible: 'system',
          icon: CheckCircle2,
          variant: 'success',
        };
      }
      if (invoice.status === 'part_paid') {
        return {
          title: 'Partial Payment',
          message: `Invoice partially paid. Remaining balance: $${invoice.balance}.`,
          action: 'pay-full',
          actionText: `Pay Remaining $${invoice.balance}`,
          responsible: 'customer',
          icon: Clock,
          variant: 'default',
        };
      }
      return {
        title: 'Invoice Created',
        message: 'Invoice has been created and is ready for payment.',
        action: 'pay-full',
        actionText: `Pay $${invoice.balance || invoice.total}`,
        responsible: 'customer',
        icon: CheckCircle2,
        variant: 'default',
      };
    }
    
    // Default fallback
    return {
      title: 'Processing',
      message: 'Your request is being processed. We\'ll notify you when there\'s an update.',
      action: null,
      actionText: null,
      responsible: 'system',
      icon: Clock,
      variant: 'info',
    };
  };
  
  const stepInfo = getNextStepInfo();
  const Icon = stepInfo.icon;
  
  const getVariantClasses = () => {
    switch (stepInfo.variant) {
      case 'success':
        return 'border-success/30 bg-success/10';
      case 'warning':
        return 'border-warning/30 bg-warning/10';
      case 'destructive':
        return 'border-destructive/30 bg-destructive/10';
      default:
        return 'border-info/30 bg-info/10';
    }
  };
  
  return (
    <Card className={`p-4 rounded-lg border ${getVariantClasses()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className={`h-5 w-5 ${
            stepInfo.variant === 'success' ? 'text-success' :
            stepInfo.variant === 'warning' ? 'text-warning' :
            stepInfo.variant === 'destructive' ? 'text-destructive' :
            'text-info'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{stepInfo.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{stepInfo.message}</p>
          
          {stepInfo.action && (
            <Button
              onClick={() => onAction(stepInfo.action)}
              variant={stepInfo.variant === 'success' ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              {stepInfo.actionText}
            </Button>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Responsible:</span>{' '}
            {stepInfo.responsible === 'customer' ? 'You' :
             stepInfo.responsible === 'admin' ? 'Admin' :
             'System'}
          </div>
        </div>
      </div>
    </Card>
  );
}

