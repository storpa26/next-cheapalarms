/**
 * Compute display status and UI flags from portal meta
 * Shared utility for both workflow simulator and production portal
 */

export function getDisplayStatus(portalMeta) {
  // Handle null/undefined portalMeta
  if (!portalMeta) {
    return 'QUOTE_REQUESTED'; // Default fallback
  }
  
  const workflow = portalMeta.workflow?.status;
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const invoice = portalMeta.invoice || {};
  
  // 1. Rejected (highest priority - overrides everything)
  if (quote.status === 'rejected') {
    return 'REJECTED';
  }
  
  // 2. Quote requested (initial state)
  if (!workflow || workflow === 'requested') {
    return 'QUOTE_REQUESTED';
  }
  
  // 3. Estimate sent - customer can upload photos (if required) or request review
  if (workflow === 'sent') {
    if (quote.photos_required && (photos.uploaded || 0) === 0) {
      return 'AWAITING_PHOTOS';
    }
    if (quote.photos_required && (photos.uploaded || 0) > 0 && !quote.approval_requested) {
      return 'PHOTOS_UPLOADED'; // Photos uploaded, ready to request review
    }
    if (!quote.photos_required && !quote.approval_requested) {
      return 'ESTIMATE_SENT'; // No photos required, can request review immediately
    }
  }

  // 4. Review requested but photos not yet submitted
  if (workflow === 'under_review' && quote.photos_required && photos.submission_status !== 'submitted') {
    return 'AWAITING_PHOTOS';
  }

  // 5. Photos submitted but not reviewed
  if (workflow === 'under_review' && quote.photos_required && photos.submission_status === 'submitted' && !photos.reviewed) {
    return 'PHOTOS_UNDER_REVIEW';
  }

  // 6. Photos reviewed but changes requested (reviewed but acceptance not enabled)
  if (workflow === 'under_review' && quote.photos_required && photos.submission_status === 'submitted' && photos.reviewed && !quote.acceptance_enabled) {
    return 'CHANGES_REQUESTED';
  }

  // 7. Review requested, no photos required, waiting for admin
  if (workflow === 'under_review' && !quote.photos_required && !quote.acceptance_enabled) {
    return 'UNDER_REVIEW';
  }

  // 8. Accepted (check BEFORE ready_to_accept - accepted is final state)
  // This prevents hydration mismatch: if quote.status === 'accepted', it should always show ACCEPTED,
  // even if workflow.status is still 'ready_to_accept' (not yet updated)
  if (workflow === 'accepted' || quote.status === 'accepted') {
    if (invoice.id) {
      return 'INVOICE_READY';
    }
    return 'ACCEPTED';
  }

  // 9. Ready to accept (acceptance enabled) - only if not already accepted
  if (workflow === 'ready_to_accept' && quote.acceptance_enabled) {
    return 'READY_TO_ACCEPT';
  }

  // 10. Paid
  if (workflow === 'paid' || quote.status === 'paid') {
    return 'PAID';
  }

  // 11. Completed
  if (workflow === 'completed' || quote.status === 'completed') {
    return 'COMPLETED';
  }

  // Default fallback
  return 'QUOTE_REQUESTED';
}

export function getStatusMessage(displayStatus) {
  const messages = {
    'QUOTE_REQUESTED': 'Quote requested - waiting for estimate',
    'ESTIMATE_SENT': 'Estimate sent - ready for review',
    'AWAITING_PHOTOS': 'Please upload photos to proceed',
    'PHOTOS_UPLOADED': 'Photos uploaded - ready to request review',
    'PHOTOS_UNDER_REVIEW': 'Photos under review - admin will notify you',
    'UNDER_REVIEW': 'Under review - admin will notify you when acceptance is enabled',
    'CHANGES_REQUESTED': 'Changes requested - please resubmit photos',
    'READY_TO_ACCEPT': 'Approved - you can now accept the estimate',
    'ACCEPTED': 'Estimate accepted',
    'INVOICE_READY': 'Invoice ready for payment',
    'PAID': 'Payment received',
    'COMPLETED': 'Project completed',
    'REJECTED': 'Estimate rejected',
  };
  return messages[displayStatus] || 'Unknown status';
}

export function computeUIState(portalMeta) {
  // Handle null/undefined portalMeta - return safe default UI state
  if (!portalMeta) {
    return {
      displayStatus: 'QUOTE_REQUESTED',
      statusMessage: 'Quote requested - waiting for estimate',
      canRequestReview: false,
      canUploadPhotos: false,
      canSubmitPhotos: false,
      canAccept: false,
      canPay: false,
      canReject: false,
      // Admin action flags
      adminCanSendEstimate: false,
      adminCanFinish: false,
      adminCanRequestChanges: false,
      adminCanTogglePhotosRequired: false,
    };
  }
  
  const workflow = portalMeta.workflow || {};
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const invoice = portalMeta.invoice || {};
  
  const isAccepted = workflow.status === 'accepted' || quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  const isPaid = workflow.status === 'paid' || quote.status === 'paid';
  
  const displayStatus = getDisplayStatus(portalMeta);
  const statusMessage = getStatusMessage(displayStatus);
  
  return {
    displayStatus,
    statusMessage,
    
    // Customer actions
    // Only show "Request Review" button when resubmitting photos (after admin requested changes)
    // Check for change_requested_at to detect that admin reviewed once and requested changes
    // After resubmission, workflow.status is 'sent' (not auto-requested), so check for 'sent' OR 'under_review'
    canRequestReview: quote.photos_required && 
      photos.submission_status === 'submitted' && 
      quote.change_requested_at && 
      !quote.acceptance_enabled &&
      !quote.approval_requested &&
      (workflow.status === 'sent' || workflow.status === 'under_review'),
    canUploadPhotos: quote.photos_required && 
      (workflow.status === 'sent' || workflow.status === 'under_review') && 
      !isAccepted && !isRejected,
    canSubmitPhotos: quote.photos_required && 
      (photos.uploaded || 0) > 0 && 
      photos.submission_status !== 'submitted' && 
      (workflow.status === 'sent' || workflow.status === 'under_review') && 
      !isAccepted && !isRejected,
    canAccept: !isAccepted && !isRejected && quote.acceptance_enabled && workflow.status === 'ready_to_accept',
    canPay: isAccepted && invoice.id && !isPaid,
    canReject: workflow.status !== 'requested' && !isAccepted && !isRejected,
    
    // Admin actions - Single button with two states
    // Show "Send Estimate" when estimate hasn't been sent yet
    adminCanSendEstimate: workflow.status === 'requested' || !workflow.status,
    // Show "Finish" when photos submitted and need review, OR no photos and review requested
    adminCanFinish: (quote.photos_required && workflow.status === 'under_review' && 
      photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled && quote.approval_requested) ||
      (!quote.photos_required && workflow.status === 'under_review' && 
      !quote.acceptance_enabled && quote.sentAt && quote.approval_requested),
    // Can request changes when review requested, photos submitted, not reviewed
    adminCanRequestChanges: quote.photos_required && workflow.status === 'under_review' && 
      photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled && quote.approval_requested,
    adminCanTogglePhotosRequired: !isAccepted && !isRejected,
  };
}

