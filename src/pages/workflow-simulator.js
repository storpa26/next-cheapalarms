import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CustomerView } from '../components/workflow-simulator/CustomerView';
import { AdminView } from '../components/workflow-simulator/AdminView';
import { SystemTrace } from '../components/workflow-simulator/SystemTrace';
import { getInitialState, scenarios } from '../lib/workflow-simulator/scenarios';
import { mockResponse, getApiCallDetails } from '../lib/workflow-simulator/api-mocks';
import { createStateUpdate, createEventLogEntry } from '../lib/workflow-simulator/state-manager';
import { computeUIState } from '../lib/workflow-simulator/status-computer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { RotateCcw, AlertCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

// Security: Validation helpers
const MAX_ARRAY_SIZE = 100;
const MAX_AMOUNT = 1000000;
const MAX_REASON_LENGTH = 500;

function sanitizeReason(reason) {
  if (typeof reason !== 'string') return 'Not interested';
  // Comprehensive sanitization to prevent XSS and injection attacks
  return reason
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
    .replace(/data:/gi, '') // Remove data: protocol
    .slice(0, MAX_REASON_LENGTH)
    .trim() || 'Not interested';
}

function validateAmount(amount) {
  const numAmount = Number(amount);
  if (!isFinite(numAmount) || numAmount < 0 || numAmount > MAX_AMOUNT) {
    return null; // Invalid amount
  }
  return numAmount;
}

function validateEstimateId(estimateId) {
  if (typeof estimateId !== 'string') return false;
  // Allow alphanumeric, hyphens, underscores, max 100 chars
  return /^[a-zA-Z0-9_-]{1,100}$/.test(estimateId);
}

function validateLocationId(locationId) {
  if (typeof locationId !== 'string') return false;
  // Allow alphanumeric, hyphens, underscores, max 50 chars
  return /^[a-zA-Z0-9_-]{1,50}$/.test(locationId);
}

function validateInvoiceId(invoiceId) {
  if (typeof invoiceId !== 'string') return false;
  // Allow format: inv- followed by alphanumeric, hyphens, underscores, max 50 chars
  return /^inv-[a-zA-Z0-9_-]{1,50}$/.test(invoiceId);
}

function validateScenarioKey(scenarioKey) {
  if (typeof scenarioKey !== 'string') return false;
  // Check if key exists in scenarios object and is not a prototype property
  return scenarios.hasOwnProperty(scenarioKey);
}

function validateScenarioState(state) {
  if (!state || typeof state !== 'object') return false;
  const requiredKeys = ['workflow', 'quote', 'photos', 'invoice', 'account'];
  if (!requiredKeys.every(key => state[key] && typeof state[key] === 'object')) {
    return false;
  }
  // Recursively check for dangerous keys in scenario state
  return !hasDangerousKeys(state, 0, 20); // Allow deeper nesting for scenarios
}

// Security: Recursively check for dangerous keys (imported from state-manager or defined here)
function hasDangerousKeys(obj, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return true; // Prevent deep nesting attacks
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key in obj) {
    if (dangerousKeys.includes(key)) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (hasDangerousKeys(obj[key], depth + 1, maxDepth)) return true;
    }
  }
  return false;
}

// Security: Validate response data before using in state
function validateResponseEstimateId(estimateId) {
  if (!estimateId) return null;
  return validateEstimateId(estimateId) ? estimateId : null;
}

function validateResponseInvoice(invoice) {
  if (!invoice || typeof invoice !== 'object') return null;
  if (!validateInvoiceId(invoice.id)) return null;
  
  // Validate invoice properties
  const validatedTotal = validateAmount(invoice.total);
  const validatedPaid = validateAmount(invoice.paid);
  const validatedBalance = validateAmount(invoice.balance);
  
  if (validatedTotal === null) return null;
  
  return {
    ...invoice,
    total: validatedTotal,
    paid: validatedPaid !== null ? validatedPaid : 0,
    balance: validatedBalance !== null ? validatedBalance : 0,
    status: typeof invoice.status === 'string' ? invoice.status : 'created',
  };
}

// Security: Sanitize URL to prevent XSS
function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  // Remove dangerous characters and protocols
  return url
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .slice(0, 500); // Limit length
}

// Security: Sanitize params object recursively
function sanitizeParams(params, allowedKeys = []) {
  if (!params || typeof params !== 'object') return {};
  const sanitized = {};
  for (const key in params) {
    if (allowedKeys.length > 0 && !allowedKeys.includes(key)) continue;
    const value = params[key];
    if (typeof value === 'string') {
      sanitized[key] = value.slice(0, 1000); // Limit length
    } else if (typeof value === 'number') {
      sanitized[key] = isFinite(value) ? value : 0;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 100); // Limit array size
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeParams(value, []); // Recursive, no key restrictions for nested
    }
  }
  return sanitized;
}

// Security: Validate updates object structure
function validateUpdatesStructure(updates) {
  if (!updates || typeof updates !== 'object') return false;
  // Check for dangerous top-level keys
  const allowedKeys = ['workflow', 'quote', 'photos', 'invoice', 'account', 'estimateId', 'locationId'];
  for (const key in updates) {
    if (!allowedKeys.includes(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid update key: ${key}`);
      }
      return false;
    }
  }
  // Check for dangerous keys recursively
  if (hasDangerousKeys(updates)) {
    return false;
  }
  return true;
}

function safeJsonClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to clone state:', error);
    }
    return null;
  }
}

function logError(message, error = null) {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
  // In production, you could send to error tracking service
}

export default function WorkflowSimulator() {
  const [portalMeta, setPortalMeta] = useState(getInitialState());
  const [previousState, setPreviousState] = useState(null);
  const [apiCalls, setApiCalls] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [mockMode, setMockMode] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('photos-required-normal');
  const [estimateId, setEstimateId] = useState('sample-est-123');
  
  const uiState = computeUIState(portalMeta);
  
  // Load scenario
  const loadScenario = useCallback((scenarioKey) => {
    // Security: Validate scenario key before accessing
    if (!validateScenarioKey(scenarioKey)) {
      logError(`Invalid scenario key: ${scenarioKey}`);
      return;
    }
    
    const scenario = scenarios[scenarioKey];
    if (!scenario) {
      logError(`Scenario not found: ${scenarioKey}`);
      return;
    }
    
    // Security: Validate scenario state structure and values
    if (!validateScenarioState(scenario.state)) {
      logError('Invalid scenario state structure or dangerous keys detected');
      return;
    }
    
    // Preserve only estimateId and locationId, replace everything else
    setPortalMeta({
      estimateId: portalMeta.estimateId || 'sample-est-123',
      locationId: portalMeta.locationId || 'aLTXtdwNknfmEFo3WBIX',
      ...scenario.state,
    });
    setPreviousState(null);
    setApiCalls([]);
    setEventLog([]);
  }, [portalMeta.estimateId, portalMeta.locationId]);
  
  // Reset to initial state
  const handleReset = () => {
    setPortalMeta(getInitialState());
    setPreviousState(null);
    setApiCalls([]);
    setEventLog([]);
  };
  
  
  // Security: Rate limiting - track last action time
  const lastActionTimeRef = useRef(0);
  const ACTION_DEBOUNCE_MS = 300;

  // Handle actions
  const handleAction = useCallback(async (action, params = {}) => {
    // Security: Rate limiting
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_DEBOUNCE_MS) {
      return; // Ignore rapid successive calls
    }
    lastActionTimeRef.current = now;
    
    // Security: Validate action type
    if (typeof action !== 'string' || !action.trim()) {
      logError('Invalid action type:', action);
      return;
    }
    
    // Security: Validate params
    if (params && typeof params !== 'object') {
      logError('Invalid params type');
      return;
    }
    // Security: Sanitize params to prevent injection
    const sanitizedParams = sanitizeParams(params || {}, []);
    
    // Security: Safe JSON clone with error handling
    const clonedState = safeJsonClone(portalMeta);
    if (clonedState === null) {
      logError('Failed to clone state for diff');
      return; // Don't proceed if cloning fails
    }
    setPreviousState(clonedState);
    
    // Security: Validate estimateId
    if (!validateEstimateId(estimateId)) {
      logError('Invalid estimateId format');
      return;
    }
    
    // Security: Validate locationId
    if (!validateLocationId(portalMeta.locationId)) {
      logError('Invalid locationId format');
      return;
    }
    
    let endpoint = '';
    let method = 'POST';
    let body = {};
    let updates = {};
    let actor = 'customer';
    let actionName = '';
    
    // Customer actions
    if (action === 'request-quote') {
      endpoint = '/api/quote-request';
      body = {
        contact: { name: 'John Doe', email: 'john@example.com', phone: '+61400000000' },
        items: [{ name: 'Product 1', qty: 1, amount: 650 }],
        locationId: portalMeta.locationId,
      };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      // Security: Validate response data
      const validatedEstimateId = validateResponseEstimateId(response.estimateId) || estimateId;
      const validatedPortalUrl = response.portalUrl 
        ? sanitizeUrl(response.portalUrl)
        : sanitizeUrl(`http://localhost:3000/portal?estimateId=${validatedEstimateId}&inviteToken=abc123`);
      
      // Step 1: Create estimate
      let tempUpdates = {
        estimateId: validatedEstimateId,
        workflow: {
          status: 'requested',
          currentStep: 1,
          requestedAt: new Date().toISOString(),
        },
        quote: {
          status: null,
          statusLabel: null,
          number: 'EST-' + Math.floor(Math.random() * 1000),
          photos_required: portalMeta.quote?.photos_required ?? null, // Preserve existing value from scenario
          acceptance_enabled: false,
        },
        account: {
          status: 'pending',
          inviteToken: 'abc123',
          portalUrl: validatedPortalUrl || `http://localhost:3000/portal?estimateId=${validatedEstimateId}&inviteToken=abc123`,
        },
      };
      
      // Step 2: Automatically send estimate
      const sendEndpoint = '/ca/v1/admin/estimates/' + validatedEstimateId + '/send';
      const sendBody = { locationId: portalMeta.locationId, method: 'email' };
      const sendResponse = mockResponse(sendEndpoint, method, sendBody, { ...portalMeta, ...tempUpdates });
      
      // Update with sent status (NEW: workflow.status = 'sent', NOT 'reviewing')
      updates = {
        ...tempUpdates,
        workflow: {
          ...tempUpdates.workflow,
          status: 'sent', // NEW: Changed from 'reviewing' to 'sent'
          currentStep: 2,
        },
        quote: {
          ...tempUpdates.quote,
          status: 'sent',
          statusLabel: 'Sent',
          sentAt: new Date().toISOString(),
          sendCount: 1,
          acceptance_enabled: false,
          approval_requested: false, // NEW: Customer hasn't requested approval yet
          photos_required: tempUpdates.quote.photos_required, // Preserve photos_required value
        },
      };
      actionName = 'Customer requested quote (estimate automatically created and sent)';
      
      // Log both API calls
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      const sendApiCall = getApiCallDetails(sendEndpoint, method, sendBody, sendResponse);
      setApiCalls(prev => {
        const updated = [...prev, apiCall, sendApiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success('Quote Requested & Estimate Sent', {
        description: 'Your quote request was received. Estimate has been automatically created and sent to your email.',
        duration: 5000,
      });
    } else if (action === 'upload-photos') {
      // Validate state
      if (!portalMeta.quote?.photos_required) {
        return; // Photos not required
      }
      if (portalMeta.workflow?.status === 'requested') {
        return; // Estimate not sent yet
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot upload photos for rejected estimate
      }
      // Allow upload if: no submission yet, OR resubmission after changes requested
      const isResubmission = portalMeta.photos?.submission_status === 'submitted' && 
                             portalMeta.photos?.reviewed && 
                             !portalMeta.quote?.acceptance_enabled;
      // Allow upload if: not submitted yet, OR resubmission after changes requested
      if (portalMeta.photos?.submission_status === 'submitted' && !isResubmission) {
        return; // Photos already submitted (and not a resubmission)
      }
      
      // For resubmission after changes requested, allow uploading more photos
      
      // Simulate uploading photos
      updates = {
        photos: {
          ...portalMeta.photos,
          uploaded: (portalMeta.photos?.uploaded || 0) + 1,
          total: (portalMeta.photos?.total || 0) + 1,
          items: [...(portalMeta.photos?.items || []), { id: Date.now(), product: `Product ${(portalMeta.photos?.items || []).length + 1}` }],
        },
      };
      actionName = 'Customer uploaded photo';
      
      // Toast notification
      toast.success('Photo Uploaded', {
        description: `Photo ${(portalMeta.photos?.uploaded || 0) + 1} uploaded successfully. Upload more photos or submit when ready.`,
        duration: 4000,
      });
    } else if (action === 'submit-photos') {
      // Validate state
      if (!portalMeta.quote?.photos_required) {
        return; // Photos not required
      }
      if ((portalMeta.photos?.uploaded || 0) === 0) {
        return; // No photos uploaded
      }
      if (portalMeta.workflow?.status === 'requested') {
        return; // Estimate not sent yet
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot submit photos for rejected estimate
      }
      
      // Check if this is a resubmission after changes requested
      const isResubmission = portalMeta.photos?.submission_status === 'submitted' && 
                             portalMeta.photos?.reviewed && 
                             !portalMeta.quote?.acceptance_enabled;
      
      // Prevent submission if already submitted (unless resubmission)
      if (portalMeta.photos?.submission_status === 'submitted' && !isResubmission) {
        return; // Photos already submitted (and not a resubmission)
      }
      
      endpoint = '/ca/v1/portal/submit-photos';
      body = { estimateId, locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        photos: {
          ...portalMeta.photos,
          submission_status: 'submitted',
          submitted_at: new Date().toISOString(),
          // Clear reviewed flag on resubmission (goes back to under review)
          ...(isResubmission ? {
            reviewed: false,
            reviewed_at: null,
            reviewed_by: null,
          } : {}),
        },
        workflow: {
          ...portalMeta.workflow,
          // On resubmission, change from 'ready_to_accept' or 'under_review' back to 'under_review'
          // Otherwise, preserve existing status or set to 'under_review'
          status: isResubmission 
            ? 'under_review' 
            : (portalMeta.workflow?.status === 'under_review' || portalMeta.workflow?.status === 'ready_to_accept')
              ? portalMeta.workflow.status
              : 'under_review',
          currentStep: 2,
        },
      };
      actionName = isResubmission ? 'Customer resubmitted photos (after changes requested)' : 'Customer submitted photos';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success(isResubmission ? 'Photos Resubmitted' : 'Photos Submitted', {
        description: isResubmission 
          ? 'Your photos have been resubmitted for review. Admin will review and notify you.'
          : 'Your photos have been submitted for review. Admin will review and notify you when ready.',
        duration: 5000,
      });
    } else if (action === 'request-review') {
      // NEW: Customer requests review after uploading photos
      // This also submits photos if they haven't been submitted yet
      // Validate state
      if (portalMeta.workflow?.status !== 'sent') {
        return; // Can only request review when estimate is sent
      }
      if (portalMeta.quote?.approval_requested) {
        return; // Already requested review
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot request review for rejected estimate
      }
      
      // If photos required, must have uploaded at least one
      if (portalMeta.quote?.photos_required && (portalMeta.photos?.uploaded || 0) === 0) {
        return; // No photos uploaded yet
      }
      
      endpoint = '/ca/v1/portal/request-review';
      body = { estimateId, locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      // If photos required and not yet submitted, submit them now
      const shouldSubmitPhotos = portalMeta.quote?.photos_required && 
        portalMeta.photos?.submission_status !== 'submitted' && 
        (portalMeta.photos?.uploaded || 0) > 0;
      
      updates = {
        quote: {
          ...portalMeta.quote,
          approval_requested: true, // Request review
        },
        workflow: {
          ...portalMeta.workflow,
          status: 'under_review', // Transition to 'under_review'
          currentStep: 2,
        },
        // If photos need to be submitted, do it now
        ...(shouldSubmitPhotos ? {
          photos: {
            ...portalMeta.photos,
            submission_status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
        } : {}),
      };
      actionName = shouldSubmitPhotos 
        ? 'Customer requested review (photos submitted automatically)'
        : 'Customer requested review';
      
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success('Review Requested', {
        description: shouldSubmitPhotos
          ? 'Your photos have been submitted and review request sent. Admin will review and notify you when acceptance is enabled.'
          : 'Your review request has been submitted. Admin will review and notify you when acceptance is enabled.',
        duration: 5000,
      });
    } else if (action === 'request-changes') {
      // Admin action: Review photos but request changes (don't enable acceptance)
      // Validate state
      if (!portalMeta.quote?.photos_required) {
        return; // Photos not required
      }
      if (portalMeta.photos?.submission_status !== 'submitted') {
        return; // Photos not submitted
      }
      if (portalMeta.photos?.reviewed && !portalMeta.quote?.acceptance_enabled) {
        return; // Already requested changes
      }
      if (portalMeta.quote?.acceptance_enabled) {
        return; // Acceptance already enabled - cannot request changes
      }
      if (portalMeta.workflow?.status === 'requested') {
        return; // Estimate not sent yet
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot request changes for rejected estimate
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/request-changes';
      method = 'POST';
      body = { locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        photos: {
          ...portalMeta.photos,
          reviewed: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 1, // Admin user ID
        },
        workflow: {
          ...portalMeta.workflow,
          status: 'under_review', // NEW: Keep in 'under_review' when changes requested
          reviewedAt: new Date().toISOString(),
          currentStep: 2,
        },
        // Note: acceptance_enabled remains false - this is the key difference
      };
      actor = 'admin';
      actionName = 'Admin reviewed photos and requested changes';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.warning('Changes Requested', {
        description: 'Admin has reviewed your photos and requested changes or additional photos. Please resubmit.',
        duration: 5000,
      });
    } else if (action === 'accept') {
      // Validate state
      if (!portalMeta.quote?.acceptance_enabled) {
        return; // Acceptance not enabled
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot accept rejected estimate
      }
      
      endpoint = '/api/portal/accept';
      body = { estimateId, locationId: portalMeta.locationId };
      
      // Simulate the two-step process
      const acceptResponse = mockResponse('/ca/v1/portal/accept', method, body, portalMeta);
      const invoiceResponse = mockResponse('/ca/v1/portal/create-invoice', method, body, portalMeta);
      
      // Validate invoice was created
      if (!invoiceResponse.invoice) {
        logError('Invoice creation failed');
        return; // Don't update state if invoice creation failed
      }
      
      // Security: Validate response invoice data
      const validatedInvoice = validateResponseInvoice(invoiceResponse.invoice);
      if (!validatedInvoice) {
        logError('Invalid invoice data in response');
        return;
      }
      
      updates = {
        quote: {
          ...portalMeta.quote,
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
        },
        workflow: {
          ...portalMeta.workflow,
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          currentStep: 3,
        },
        invoice: validatedInvoice,
      };
      actionName = 'Customer accepted estimate';
      
      // Log both API calls
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [
          ...prev,
          getApiCallDetails('/ca/v1/portal/accept', method, body, acceptResponse),
          getApiCallDetails('/ca/v1/portal/create-invoice', method, body, invoiceResponse),
        ];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success('Estimate Accepted', {
        description: 'Your estimate has been accepted. Invoice has been automatically created and is ready for payment.',
        duration: 5000,
      });
    } else if (action === 'pay-partial' || action === 'pay-full') {
      // Validate invoice exists
      if (!portalMeta.invoice?.id) {
        return; // No invoice to pay
      }
      // Security: Validate invoice ID format
      if (!validateInvoiceId(portalMeta.invoice.id)) {
        logError('Invalid invoice ID format');
        return;
      }
      // Validate estimate is accepted
      if (portalMeta.workflow?.status !== 'accepted' && portalMeta.quote?.status !== 'accepted') {
        return; // Estimate must be accepted before payment
      }
      
      endpoint = '/ca/v1/portal/confirm-payment';
      
      // Security: Validate and sanitize amount
      let amount;
      if (action === 'pay-full') {
        const balance = portalMeta.invoice?.balance || 0;
        if (balance <= 0) {
          logError('Cannot pay: balance is zero or negative');
          toast.error('Payment Failed', {
            description: 'Invoice balance is zero or negative. Nothing to pay.',
            duration: 5000,
          });
          return;
        }
        amount = balance;
      } else {
        const validatedAmount = validateAmount(sanitizedParams.amount || 200);
        if (validatedAmount === null) {
          logError('Invalid payment amount:', sanitizedParams.amount);
          return; // Invalid amount
        }
        amount = validatedAmount;
      }
      
      // Validate amount
      if (amount <= 0) {
        return; // Invalid amount
      }
      
      // CRITICAL FIX: Validate payment doesn't exceed balance
      const currentBalance = portalMeta.invoice?.balance || 0;
      if (amount > currentBalance) {
        logError('Payment amount exceeds remaining balance');
        toast.error('Payment Failed', {
          description: `Payment amount ($${amount}) exceeds remaining balance ($${currentBalance}).`,
          duration: 5000,
        });
        return;
      }
      
      body = { estimateId, locationId: portalMeta.locationId, invoiceId: portalMeta.invoice.id, amount };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      // Validate response
      if (!response.ok || !response.invoice) {
        logError('Payment failed:', response.error || 'Unknown error');
        return; // Payment failed, don't update state
      }
      
      // Security: Validate response invoice data
      const validatedInvoice = validateResponseInvoice(response.invoice);
      if (!validatedInvoice) {
        logError('Invalid invoice data in response');
        return;
      }
      
      updates = {
        invoice: {
          ...portalMeta.invoice,
          paid: validatedInvoice.paid,
          balance: validatedInvoice.balance,
          status: validatedInvoice.status,
        },
        workflow: validatedInvoice.status === 'paid' ? {
          ...portalMeta.workflow,
          status: 'paid',
          paidAt: new Date().toISOString(),
          currentStep: 5,
        } : portalMeta.workflow,
      };
      actionName = `Customer paid $${amount}${action === 'pay-partial' ? ' (partial)' : ' (full)'}`;
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      const isFullyPaid = validatedInvoice.status === 'paid';
      toast.success(isFullyPaid ? 'Payment Complete' : 'Payment Received', {
        description: isFullyPaid
          ? `Full payment of $${amount} received. Invoice is now fully paid.`
          : `Payment of $${amount} received. Remaining balance: $${validatedInvoice.balance}.`,
        duration: 5000,
      });
    } else if (action === 'reject') {
      // Validate state
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Cannot reject already accepted estimate
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Already rejected
      }
      if (!portalMeta.workflow?.status || portalMeta.workflow.status === 'requested') {
        return; // Cannot reject before estimate is sent
      }
      
      endpoint = '/ca/v1/portal/reject';
      // Security: Sanitize reason
      const sanitizedReason = sanitizeReason(sanitizedParams.reason);
      body = { estimateId, locationId: portalMeta.locationId, reason: sanitizedReason };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        quote: {
          ...portalMeta.quote,
          status: 'rejected',
          acceptance_enabled: false, // Clear acceptance when rejected
          enabled_at: null,
          enabled_by: null,
        },
      };
      actionName = 'Customer rejected estimate';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.warning('Estimate Rejected', {
        description: 'You have rejected this estimate. No further actions are available.',
        duration: 5000,
      });
    // Admin actions
    } else if (action === 'send-estimate') {
      // Allow sending even if already sent (admin can resend/overwrite)
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot send rejected estimate
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/send';
      body = { locationId: portalMeta.locationId, method: 'email' };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        workflow: {
          ...portalMeta.workflow,
          status: 'sent', // NEW: Changed from 'reviewing' to 'sent'
          currentStep: 2,
          requestedAt: portalMeta.workflow?.requestedAt || new Date().toISOString(),
        },
        quote: {
          ...portalMeta.quote,
          status: 'sent',
          statusLabel: 'Sent',
          sentAt: new Date().toISOString(), // Overwrite previous sentAt
          sendCount: (portalMeta.quote?.sendCount || 0) + 1,
          acceptance_enabled: false, // Explicitly ensure acceptance is disabled when sending
          approval_requested: false, // Reset approval request when resending
          photos_required: portalMeta.quote?.photos_required, // Preserve photos_required value
        },
      };
      actor = 'admin';
      actionName = portalMeta.quote?.sentAt 
        ? 'Admin resent estimate to customer (overwrote previous)' 
        : 'Admin sent estimate to customer';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification (if called programmatically)
      toast.success('Estimate Sent', {
        description: 'Estimate has been sent to customer via email.',
        duration: 4000,
      });
    } else if (action === 'enable-acceptance') {
      // Validate state
      if (portalMeta.quote?.acceptance_enabled) {
        return; // Already enabled
      }
      if (portalMeta.quote?.photos_required) {
        return; // Photos required - use approve-and-enable instead
      }
      if (!portalMeta.quote?.sentAt) {
        return; // Estimate not sent yet
      }
      if (portalMeta.workflow?.status !== 'sent' && portalMeta.workflow?.status !== 'under_review' && portalMeta.workflow?.status !== 'ready_to_accept') {
        return; // Invalid workflow state
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot enable acceptance for rejected estimate
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/enable-acceptance';
      body = { locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        quote: {
          ...portalMeta.quote,
          acceptance_enabled: true,
          enabled_at: new Date().toISOString(),
          enabled_by: 1,
        },
        workflow: {
          ...portalMeta.workflow,
          status: 'ready_to_accept', // NEW: Changed from 'reviewed' to 'ready_to_accept'
          reviewedAt: new Date().toISOString(),
          currentStep: 2,
        },
      };
      actor = 'admin';
      actionName = 'Admin enabled acceptance (no photos required)';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success('Acceptance Enabled', {
        description: 'Customer can now accept the estimate. No photos were required.',
        duration: 4000,
      });
    } else if (action === 'approve-and-enable') {
      // Validate state
      if (!portalMeta.quote?.photos_required) {
        return; // Photos not required - use enable-acceptance instead
      }
      if (portalMeta.photos?.submission_status !== 'submitted') {
        return; // Photos not submitted
      }
      if (portalMeta.photos?.reviewed) {
        return; // Photos already reviewed
      }
      if (portalMeta.quote?.acceptance_enabled) {
        return; // Acceptance already enabled
      }
      if (portalMeta.workflow?.status === 'requested') {
        return; // Estimate not sent yet
      }
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Already accepted
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot approve rejected estimate
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/complete-review';
      body = { locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      updates = {
        photos: {
          ...portalMeta.photos,
          reviewed: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 1,
        },
        quote: {
          ...portalMeta.quote,
          acceptance_enabled: true,
          enabled_at: new Date().toISOString(),
          enabled_by: 1,
        },
        workflow: {
          ...portalMeta.workflow,
          status: 'ready_to_accept', // NEW: Changed from 'reviewed' to 'ready_to_accept'
          reviewedAt: new Date().toISOString(),
          currentStep: 2,
        },
      };
      actor = 'admin';
      actionName = 'Admin approved photos and enabled acceptance';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.success('Photos Approved & Acceptance Enabled', {
        description: 'Photos have been reviewed and approved. Customer can now accept the estimate.',
        duration: 5000,
      });
    } else if (action === 'toggle-photos-required') {
      // Validate state
      if (portalMeta.workflow?.status === 'accepted' || portalMeta.quote?.status === 'accepted') {
        return; // Cannot change after acceptance
      }
      if (portalMeta.quote?.status === 'rejected') {
        return; // Cannot change for rejected estimate
      }
      
      // Security: Validate photos_required is a boolean
      if (typeof sanitizedParams.photos_required !== 'boolean') {
        logError('Invalid photos_required type:', typeof sanitizedParams.photos_required);
        return; // Invalid parameter
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/set-photos-required';
      body = { locationId: portalMeta.locationId, photos_required: sanitizedParams.photos_required };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      // If toggling photos_required from true to false, clear photo submission status
      const shouldClearPhotos = portalMeta.quote?.photos_required && !sanitizedParams.photos_required;
      // CRITICAL FIX: If toggling from false to true AND acceptance is enabled, disable acceptance
      const shouldDisableAcceptance = !portalMeta.quote?.photos_required && sanitizedParams.photos_required && portalMeta.quote?.acceptance_enabled;
      
      updates = {
        quote: {
          ...portalMeta.quote,
          photos_required: sanitizedParams.photos_required,
          // Disable acceptance if photos are now required and acceptance was enabled
          ...(shouldDisableAcceptance ? {
            acceptance_enabled: false,
            enabled_at: null,
            enabled_by: null,
          } : {}),
        },
        ...(shouldClearPhotos ? {
          photos: {
            ...portalMeta.photos,
            submission_status: null,
            submitted_at: null,
            reviewed: false,
            reviewed_at: null,
            reviewed_by: null,
            uploaded: 0,
            total: 0,
            items: [],
          },
        } : {}),
      };
      actor = 'admin';
      actionName = `Admin set photos_required to ${sanitizedParams.photos_required}${shouldClearPhotos ? ' (cleared photo submission)' : ''}${shouldDisableAcceptance ? ' (disabled acceptance - photos now required)' : ''}`;
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification
      toast.info('Photos Requirement Updated', {
        description: sanitizedParams.photos_required
          ? 'Photos are now required. Customer must upload photos before acceptance can be enabled.'
          : 'Photos are no longer required. You can enable acceptance immediately.',
        duration: 4000,
      });
    } else if (action === 'create-invoice') {
      // Allow creating even if invoice exists (admin can overwrite)
      if (portalMeta.workflow?.status !== 'accepted' && portalMeta.quote?.status !== 'accepted') {
        return; // Estimate must be accepted first
      }
      
      endpoint = '/ca/v1/admin/estimates/' + estimateId + '/create-invoice';
      body = { locationId: portalMeta.locationId };
      const response = mockResponse(endpoint, method, body, portalMeta);
      
      // Validate invoice was created
      if (!response.invoice) {
        logError('Invoice creation failed');
        return; // Don't update state if invoice creation failed
      }
      
      // Security: Validate response invoice data
      const validatedInvoice = validateResponseInvoice(response.invoice);
      if (!validatedInvoice) {
        logError('Invalid invoice data in response');
        return;
      }
      
      updates = {
        invoice: validatedInvoice, // Overwrite previous invoice
      };
      actor = 'admin';
      actionName = portalMeta.invoice?.id 
        ? 'Admin recreated invoice (overwrote previous)' 
        : 'Admin created invoice manually';
      const apiCall = getApiCallDetails(endpoint, method, body, response);
      // Security: Limit array size to prevent memory leaks
      setApiCalls(prev => {
        const updated = [...prev, apiCall];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
      
      // Toast notification (if called programmatically)
      toast.success('Invoice Created', {
        description: portalMeta.invoice?.id 
          ? 'Invoice has been recreated (previous invoice overwritten).'
          : 'Invoice has been created and is ready for payment.',
        duration: 4000,
      });
    } else {
      // Security: Log unknown actions for debugging
      logError(`Unknown action: ${action}`);
      return; // Don't proceed with unknown actions
    }
    
    // Apply updates
    if (Object.keys(updates).length > 0) {
      // Security: Validate updates structure before applying
      if (!validateUpdatesStructure(updates)) {
        logError('Invalid updates structure, rejecting update');
        return;
      }
      
      setPortalMeta(createStateUpdate(updates));
      
      // Log event
      const event = createEventLogEntry(
        actionName,
        actor,
        updates,
        endpoint ? { endpoint, method } : null
      );
      // Security: Limit array size to prevent memory leaks
      setEventLog(prev => {
        const updated = [...prev, event];
        return updated.slice(-MAX_ARRAY_SIZE);
      });
    }
  }, [estimateId, portalMeta]);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer/Admin Workflow Simulator</h1>
            <p className="text-muted-foreground mt-1">
              Visual prototype to understand the simplified workflow
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Beginning
          </Button>
        </div>
        
        {/* Top Control Bar */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Scenario Preset</label>
              <Select value={selectedScenario} onValueChange={(value) => {
                setSelectedScenario(value);
                loadScenario(value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scenarios).map(([key, scenario]) => (
                    <SelectItem key={key} value={key}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Estimate ID</label>
              <Input
                value={estimateId}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Security: Validate estimateId format
                  if (validateEstimateId(newValue) || newValue === '') {
                    setEstimateId(newValue);
                  }
                }}
                placeholder="sample-est-123"
                maxLength={100}
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center gap-2 w-full">
                <Switch
                  checked={mockMode}
                  onCheckedChange={setMockMode}
                  disabled={true}
                />
                <label className="text-sm text-muted-foreground">
                  {mockMode ? 'Mock Mode' : 'Real API Mode'} (Mock only - Real API not implemented)
                </label>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => loadScenario(selectedScenario)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Load Scenario
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Current State Indicator */}
        <Card className="p-4 bg-muted">
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Current State (Internal)</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Workflow:</span>{' '}
                <Badge variant="outline">{portalMeta.workflow?.status || 'null'}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Acceptance:</span>{' '}
                <Badge variant={portalMeta.quote?.acceptance_enabled ? 'default' : 'secondary'}>
                  {portalMeta.quote?.acceptance_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Photos Required:</span>{' '}
                <Badge variant={portalMeta.quote?.photos_required ? 'default' : 'secondary'}>
                  {portalMeta.quote?.photos_required ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Photos Submitted:</span>{' '}
                <Badge variant={portalMeta.photos?.submission_status === 'submitted' ? 'default' : 'secondary'}>
                  {portalMeta.photos?.submission_status === 'submitted' ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Photos Reviewed:</span>{' '}
                <Badge variant={portalMeta.photos?.reviewed ? 'default' : 'secondary'}>
                  {portalMeta.photos?.reviewed ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Accepted:</span>{' '}
                <Badge variant={portalMeta.workflow?.status === 'accepted' ? 'default' : 'destructive'}>
                  {portalMeta.workflow?.status === 'accepted' ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Main Content: Three Column Layout (ORIGINAL VERSION 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer View (Left Column) */}
          <div className="lg:col-span-1">
            <CustomerView
              portalMeta={portalMeta}
              onAction={handleAction}
              uiState={uiState}
            />
          </div>
          
          {/* Admin View (Middle Column) */}
          <div className="lg:col-span-1">
            <AdminView
              portalMeta={portalMeta}
              onAction={handleAction}
              uiState={uiState}
            />
          </div>
          
          {/* System Trace (Right Column) */}
          <div className="lg:col-span-1">
            <SystemTrace
              apiCalls={apiCalls}
              portalMeta={portalMeta}
              previousState={previousState}
              eventLog={eventLog}
              onClearLog={() => setEventLog([])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side check - always allow access
export async function getServerSideProps(context) {
  // Always allow access to workflow simulator
  return { props: {} };
}

