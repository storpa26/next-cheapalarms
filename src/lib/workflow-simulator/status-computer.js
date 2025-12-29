/**
 * Compute display status and UI flags from portal meta
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
      return 'PHOTOS_UPLOADED'; // NEW: Photos uploaded, ready to request review
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

  // 7. Ready to accept (acceptance enabled, not yet accepted)
  if (workflow === 'ready_to_accept' && quote.acceptance_enabled && workflow !== 'accepted') {
    return 'READY_TO_ACCEPT';
  }
  
  // 6. Accepted
  if (workflow === 'accepted' || quote.status === 'accepted') {
    if (invoice?.status === 'paid') {
      return 'PAID';
    }
    if (invoice?.status === 'part_paid') {
      return 'PART_PAID';
    }
    if (invoice?.status === 'created' || invoice?.id) {
      return 'INVOICE_CREATED';
    }
    return 'ACCEPTED';
  }
  
  // 8. Fallback: Under review (approval requested, waiting for admin)
  if (workflow === 'under_review') {
    return 'UNDER_REVIEW';
  }
  
  // 9. Fallback: Estimate sent (but approval not requested yet)
  return 'ESTIMATE_SENT';
}

export function getStatusMessage(displayStatus) {
  const messages = {
    QUOTE_REQUESTED: 'Your quote request has been received. We\'ll review it and get back to you soon.',
    ESTIMATE_SENT: 'Your estimate has been sent. Upload photos (if required) and request review when ready.',
    PHOTOS_UPLOADED: 'Photos uploaded. Click "Request Review" to submit for admin review.',
    UNDER_REVIEW: 'Your review request is being processed. Admin will review and notify you when acceptance is enabled.',
    AWAITING_PHOTOS: 'Please upload installation photos so we can review your property and finalize pricing.',
    PHOTOS_UNDER_REVIEW: 'Your photos have been submitted. We\'re reviewing them and will notify you when ready.',
    CHANGES_REQUESTED: 'We\'ve reviewed your photos and need some changes or additional photos. Please resubmit.',
    READY_TO_ACCEPT: 'Your estimate is ready! Review the details and accept when you\'re ready.',
    ACCEPTED: 'Estimate accepted. Invoice is being created...',
    INVOICE_CREATED: 'Estimate accepted. Invoice has been created and is ready for payment.',
    PART_PAID: 'Invoice partially paid. Remaining balance: $',
    PAID: 'Invoice fully paid. Installation can be scheduled.',
    REJECTED: 'Estimate has been rejected.',
  };
  
  return messages[displayStatus] || messages.ESTIMATE_SENT;
}

export function computeUIState(portalMeta) {
  // Handle null/undefined portalMeta - return safe default UI state
  if (!portalMeta) {
    return {
      displayStatus: 'QUOTE_REQUESTED',
      statusMessage: 'Quote requested',
      canUploadPhotos: false,
      canSubmitPhotos: false,
      canAccept: false,
      canPay: false,
      invoiceVisible: false,
      acceptButtonVisible: false,
      canAcceptReason: {
        acceptance_enabled: false,
        not_accepted: true,
        not_rejected: true,
        photos_ok: false,
      },
      adminCanSendEstimate: false,
      adminCanEnableAcceptance: false,
      adminCanApproveAndEnable: false,
      adminCanRequestChanges: false,
      adminCanTogglePhotosRequired: false,
    };
  }
  
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const workflow = portalMeta.workflow || {};
  const invoice = portalMeta.invoice || {};
  
  const displayStatus = getDisplayStatus(portalMeta);
  const isAccepted = workflow.status === 'accepted' || quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  
  return {
    displayStatus,
    statusMessage: getStatusMessage(displayStatus),
    
    // Customer actions
    // NEW: Can request review when photos uploaded (if required) or immediately (if not required)
    canRequestReview: workflow.status === 'sent' && !quote.approval_requested && !isAccepted && !isRejected &&
      (!quote.photos_required || (photos.uploaded || 0) > 0),
    // Allow upload if: estimate sent and (not submitted yet, OR photos reviewed but changes requested)
    canUploadPhotos: quote.photos_required && workflow.status === 'sent' && 
      (photos.submission_status !== 'submitted' || (photos.reviewed && !quote.acceptance_enabled)) && 
      !isAccepted && !isRejected,
    // Allow submit if: has photos AND (not submitted yet OR resubmission after changes requested)
    canSubmitPhotos: quote.photos_required && workflow.status === 'under_review' && (photos.uploaded || 0) > 0 && 
      (photos.submission_status !== 'submitted' || (photos.reviewed && !quote.acceptance_enabled)) && 
      !isAccepted && !isRejected,
    canAccept: workflow.status === 'ready_to_accept' && quote.acceptance_enabled && !isAccepted && !isRejected,
    canPay: invoice?.id && (invoice?.status === 'created' || invoice?.status === 'part_paid') && (invoice?.balance || 0) > 0 && (workflow.status === 'accepted' || quote.status === 'accepted'),
    
    // Visibility flags
    invoiceVisible: !!invoice?.id || invoice?.status === 'created' || invoice?.status === 'part_paid' || invoice?.status === 'paid',
    acceptButtonVisible: quote.acceptance_enabled && !isAccepted && !isRejected,
    
    // Reasons (for debugging)
    canAcceptReason: {
      acceptance_enabled: quote.acceptance_enabled,
      not_accepted: !isAccepted,
      not_rejected: !isRejected,
      photos_ok: !quote.photos_required || photos.reviewed,
    },
    
    // Admin actions
    adminCanSendEstimate: workflow.status === 'requested' || !workflow.status,
    // NEW: Can enable acceptance when review requested, no photos required, and estimate sent
    adminCanEnableAcceptance: !quote.acceptance_enabled && !quote.photos_required && 
      workflow.status === 'under_review' && quote.sentAt && quote.approval_requested,
    // NEW: Can approve and enable when review requested, photos submitted, not reviewed, and not enabled
    adminCanApproveAndEnable: quote.photos_required && workflow.status === 'under_review' && 
      photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled && quote.approval_requested,
    // NEW: Can request changes when review requested, photos submitted, not reviewed
    adminCanRequestChanges: quote.photos_required && workflow.status === 'under_review' && 
      photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled && quote.approval_requested,
    adminCanTogglePhotosRequired: !isAccepted && !isRejected,
  };
}


