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
  
  // 3. Estimate sent but photos required and not submitted
  if (workflow !== 'requested' && quote.photos_required && photos.submission_status !== 'submitted') {
    return 'AWAITING_PHOTOS';
  }
  
  // 4. Photos submitted but not reviewed
  if (workflow !== 'requested' && quote.photos_required && photos.submission_status === 'submitted' && !photos.reviewed) {
    return 'PHOTOS_UNDER_REVIEW';
  }
  
  // 4.5. Photos reviewed but changes requested (reviewed but acceptance not enabled)
  if (workflow !== 'requested' && quote.photos_required && photos.submission_status === 'submitted' && photos.reviewed && !quote.acceptance_enabled) {
    return 'CHANGES_REQUESTED';
  }
  
  // 5. Ready to accept (acceptance enabled, not yet accepted)
  if (quote.acceptance_enabled && workflow !== 'accepted') {
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
  
  // 7. Fallback: Estimate sent (but acceptance not enabled yet)
  return 'ESTIMATE_SENT';
}

export function getStatusMessage(displayStatus) {
  const messages = {
    QUOTE_REQUESTED: 'Your quote request has been received. We\'ll review it and get back to you soon.',
    ESTIMATE_SENT: 'Your estimate is being reviewed. We\'ll notify you when it\'s ready for acceptance.',
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
    // Allow upload if: not submitted yet, OR photos reviewed but changes requested (can resubmit)
    canUploadPhotos: quote.photos_required && workflow.status !== 'requested' && 
      (photos.submission_status !== 'submitted' || (photos.reviewed && !quote.acceptance_enabled)) && 
      !isAccepted && !isRejected,
    // Allow submit if: has photos AND (not submitted yet OR resubmission after changes requested)
    canSubmitPhotos: quote.photos_required && workflow.status !== 'requested' && (photos.uploaded || 0) > 0 && 
      (photos.submission_status !== 'submitted' || (photos.reviewed && !quote.acceptance_enabled)) && 
      !isAccepted && !isRejected,
    canAccept: quote.acceptance_enabled && !isAccepted && !isRejected,
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
    adminCanEnableAcceptance: !quote.acceptance_enabled && !quote.photos_required && (workflow.status === 'reviewing' || workflow.status === 'reviewed') && quote.sentAt,
    adminCanApproveAndEnable: quote.photos_required && workflow.status !== 'requested' && workflow.status !== 'accepted' && photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled,
    adminCanRequestChanges: quote.photos_required && workflow.status !== 'requested' && workflow.status !== 'accepted' && photos.submission_status === 'submitted' && !photos.reviewed && !quote.acceptance_enabled,
    adminCanTogglePhotosRequired: !isAccepted && !isRejected,
  };
}


