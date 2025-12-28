/**
 * Step definitions for workflow simulator
 * Each step defines what action happens and what external systems are involved
 */

export const STEPS = [
  {
    id: 1,
    title: 'Customer Requests Quote',
    actor: 'customer',
    action: 'request-quote',
    description: 'Customer fills out quote request form and submits',
    whatHappens: [
      { system: 'wordpress', action: 'Initialize portal meta', description: 'Create estimate record in WordPress' },
      { system: 'ghl', action: 'Create draft estimate', description: 'Create estimate in GoHighLevel (draft status)' },
    ],
    nextStep: 2,
  },
  {
    id: 2,
    title: 'Admin Sends Estimate',
    actor: 'admin',
    action: 'send-estimate',
    description: 'Admin reviews estimate and sends it to customer',
    whatHappens: [
      { system: 'wordpress', action: 'Update meta status', description: 'Set status to "sent" in WordPress' },
      { system: 'ghl', action: 'Update estimate status', description: 'Update GHL estimate status to "sent"' },
      { system: 'email', action: 'Send email', description: 'Send estimate email to customer' },
    ],
    nextStep: 3,
    conditional: (portalMeta) => {
      // If photos required, go to photo upload step, otherwise skip to enable acceptance
      return portalMeta.quote?.photos_required ? 3 : 4;
    },
  },
  {
    id: 3,
    title: 'Customer Uploads Photos',
    actor: 'customer',
    action: 'upload-photos',
    description: 'Customer uploads required photos',
    whatHappens: [
      { system: 'wordpress', action: 'Store photos', description: 'Store photo metadata in WordPress' },
    ],
    nextStep: 3, // Can repeat
    isRepeatable: true,
    conditional: (portalMeta) => {
      // Only show if photos required and not all uploaded
      return portalMeta.quote?.photos_required && 
             (portalMeta.photos?.uploaded || 0) < (portalMeta.photos?.total || 0);
    },
  },
  {
    id: 4,
    title: 'Customer Submits Photos',
    actor: 'customer',
    action: 'submit-photos',
    description: 'Customer submits photos for admin review',
    whatHappens: [
      { system: 'wordpress', action: 'Update submission status', description: 'Mark photos as submitted' },
    ],
    nextStep: 5,
    conditional: (portalMeta) => {
      return portalMeta.quote?.photos_required && 
             portalMeta.photos?.submission_status === 'submitted';
    },
  },
  {
    id: 5,
    title: 'Admin Reviews Photos',
    actor: 'admin',
    action: 'approve-and-enable',
    description: 'Admin reviews photos and enables acceptance',
    whatHappens: [
      { system: 'wordpress', action: 'Mark photos reviewed', description: 'Update photos.reviewed flag' },
      { system: 'wordpress', action: 'Enable acceptance', description: 'Set acceptance_enabled = true' },
    ],
    nextStep: 6,
    alternativeAction: 'request-changes',
    alternativeTitle: 'Admin Requests Changes',
    alternativeDescription: 'Admin requests more photos or changes',
    alternativeWhatHappens: [
      { system: 'wordpress', action: 'Mark photos reviewed', description: 'Update photos.reviewed flag' },
      { system: 'wordpress', action: 'Keep acceptance disabled', description: 'acceptance_enabled remains false' },
    ],
    conditional: (portalMeta) => {
      return portalMeta.quote?.photos_required && 
             portalMeta.photos?.submission_status === 'submitted';
    },
  },
  {
    id: 6,
    title: 'Admin Enables Acceptance',
    actor: 'admin',
    action: 'enable-acceptance',
    description: 'Admin enables acceptance (no photos required)',
    whatHappens: [
      { system: 'wordpress', action: 'Enable acceptance', description: 'Set acceptance_enabled = true' },
    ],
    nextStep: 7,
    conditional: (portalMeta) => {
      return !portalMeta.quote?.photos_required;
    },
  },
  {
    id: 7,
    title: 'Customer Accepts Estimate',
    actor: 'customer',
    action: 'accept',
    description: 'Customer accepts the estimate',
    whatHappens: [
      { system: 'wordpress', action: 'Update status to accepted', description: 'Set quote.status = "accepted"' },
      { system: 'ghl', action: 'Create invoice', description: 'Create invoice in GoHighLevel from draft estimate' },
      { system: 'xero', action: 'Sync invoice', description: 'Automatically sync invoice to Xero' },
      { system: 'wordpress', action: 'Store invoice metadata', description: 'Save invoice ID and details locally' },
    ],
    nextStep: 8,
  },
  {
    id: 8,
    title: 'Customer Makes Payment',
    actor: 'customer',
    action: 'pay-partial',
    description: 'Customer makes partial or full payment',
    whatHappens: [
      { system: 'ghl', action: 'Record payment', description: 'Update payment status in GHL invoice' },
      { system: 'xero', action: 'Sync payment', description: 'Sync payment to Xero (if configured)' },
      { system: 'wordpress', action: 'Update invoice balance', description: 'Update paid/balance amounts' },
    ],
    nextStep: 8, // Can repeat for partial payments
    isRepeatable: true,
  },
];

/**
 * Get the current step based on portal meta state
 */
export function getCurrentStep(portalMeta) {
  const workflow = portalMeta.workflow?.status;
  const quote = portalMeta.quote || {};
  const photos = portalMeta.photos || {};
  const invoice = portalMeta.invoice || {};

  // Edge case: Rejected estimate - show appropriate step based on state
  if (quote.status === 'rejected') {
    // If rejected before sending, show step 1 (can't proceed, must reset)
    if (!quote.sentAt) {
      return 1; // Can't proceed, must reset
    }
    // If rejected after sending, show step 2 (already sent, can't proceed further)
    return 2; // Stuck at sent state
  }

  // Step 1: Quote requested (initial state OR quote created but not sent)
  // Show step 1 if:
  // - No workflow status yet (truly initial)
  // - Workflow is 'requested' AND quote.number doesn't exist yet (before step 1 completes)
  if (!workflow || (workflow === 'requested' && !quote.number)) {
    return 1;
  }

  // Step 2: Admin sends estimate
  // Show step 2 if:
  // - Workflow is 'requested' AND quote.number exists BUT quote.sentAt is null
  //   (quote created in step 1, but not yet sent)
  // - OR workflow is 'reviewing' AND quote.status is 'sent' (already sent, checking next steps)
  if ((workflow === 'requested' && quote.number && !quote.sentAt) ||
      (workflow === 'reviewing' && quote.status === 'sent')) {
    
    // If already sent, check what comes next
    if (quote.sentAt) {
      // CRITICAL FIX: If photos_required is null, admin must set it first
      // Show Step 2 until photos_required is set (true or false)
      if (quote.photos_required === null || quote.photos_required === undefined) {
        return 2; // Stay on Step 2 until admin sets photos_required
      }
      
      // Check if photos required
      if (quote.photos_required) {
        // CRITICAL FIX: After changes requested, allow resubmission
        // If photos reviewed but acceptance not enabled (changes requested),
        // allow customer to upload/resubmit photos
        if (photos.reviewed && !quote.acceptance_enabled && photos.submission_status === 'submitted') {
          // Changes requested - customer can resubmit
          // They can either upload more photos (Step 3) or resubmit existing ones (Step 4)
          // If they have photos uploaded, allow resubmission (Step 4)
          // Otherwise, they need to upload first (Step 3)
          if ((photos.uploaded || 0) > 0) {
            return 4; // Can resubmit existing photos
          } else {
            return 3; // Need to upload photos first
          }
        }
        
        // Step 3: Upload photos (if not all uploaded or no photos yet)
        if ((photos.uploaded || 0) === 0 || (photos.uploaded || 0) < (photos.total || 0)) {
          return 3;
        }
        // Step 4: Submit photos (if uploaded but not submitted)
        if ((photos.uploaded || 0) > 0 && photos.submission_status !== 'submitted') {
          return 4;
        }
        // Step 5: Review photos (if submitted but not reviewed, OR reviewed but changes requested)
        if (photos.submission_status === 'submitted' && 
            (!photos.reviewed || (photos.reviewed && !quote.acceptance_enabled))) {
          return 5;
        }
      } else {
        // Step 6: Enable acceptance (no photos)
        if (!quote.acceptance_enabled) {
          return 6;
        }
      }
    } else {
      // Not sent yet - show step 2
      return 2;
    }
  }

  // Step 7: Accept estimate (acceptance enabled but not yet accepted)
  if (quote.acceptance_enabled && workflow !== 'accepted' && quote.status !== 'accepted') {
    return 7;
  }

  // Step 8: Payment (accepted and invoice exists)
  if ((workflow === 'accepted' || quote.status === 'accepted') && invoice.id) {
    return 8;
  }

  // Edge case: Accepted but no invoice yet
  // This shouldn't happen as invoice is created on acceptance, but handle gracefully
  // Show Step 8 anyway (payment step) - it will handle the "no invoice" case in the UI
  if (workflow === 'accepted' || quote.status === 'accepted') {
    return 8; // Show payment step, UI will indicate if invoice is missing
  }

  // Default fallback: step 1
  return 1;
}

/**
 * Get step by ID
 */
export function getStepById(stepId) {
  return STEPS.find(step => step.id === stepId);
}

/**
 * Get next step considering conditionals
 */
export function getNextStep(currentStepId, portalMeta) {
  const step = getStepById(currentStepId);
  if (!step) return null;

  if (step.conditional) {
    return step.conditional(portalMeta);
  }

  return step.nextStep;
}

