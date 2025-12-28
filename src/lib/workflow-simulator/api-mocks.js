/**
 * Mock API responses for workflow simulator
 */

export function mockResponse(endpoint, method, body, portalMeta) {
  const timestamp = new Date().toISOString();
  
  // Portal endpoints
  if (endpoint.includes('/portal/submit-photos')) {
    return {
      ok: true,
      photos: {
        submission_status: 'submitted',
        submitted_at: timestamp,
        total: 7,
        uploaded: 7,
      },
      message: 'Photos submitted successfully',
    };
  }
  
  if (endpoint.includes('/portal/accept')) {
    return {
      ok: true,
      quote: {
        status: 'accepted',
        acceptedAt: timestamp,
      },
      workflow: {
        status: 'accepted',
        acceptedAt: timestamp,
      },
      externalSystems: {
        wordpress: {
          status: 'completed',
          action: 'Update status to accepted',
          details: {
            status: 'accepted',
            acceptedAt: timestamp,
          },
        },
      },
    };
  }
  
  if (endpoint.includes('/portal/create-invoice')) {
    const invoiceId = 'inv-' + Date.now();
    const invoiceNumber = 'INV-' + Math.floor(Math.random() * 1000);
    const ghlInvoiceId = 'ghl-inv-' + Date.now();
    const xeroInvoiceId = 'xero-inv-' + Date.now();
    
    return {
      ok: true,
      invoice: {
        id: invoiceId,
        number: invoiceNumber,
        status: 'created',
        total: 650,
        paid: 0,
        balance: 650,
        created_at: timestamp,
        ghlInvoiceId,
        xeroInvoiceId,
      },
      message: 'Invoice created successfully',
      externalSystems: {
        ghl: {
          status: 'completed',
          action: 'Create invoice',
          details: {
            invoiceId: ghlInvoiceId,
            invoiceNumber,
            status: 'created',
            total: 650,
          },
        },
        xero: {
          status: 'completed',
          action: 'Sync invoice',
          details: {
            invoiceId: xeroInvoiceId,
            invoiceNumber: 'XERO-' + Math.floor(Math.random() * 1000),
            status: 'AUTHORISED',
            syncedAt: timestamp,
          },
        },
        wordpress: {
          status: 'completed',
          action: 'Store invoice metadata',
          details: {
            invoiceId,
            ghlInvoiceId,
            xeroInvoiceId,
            stored: true,
          },
        },
      },
    };
  }
  
  if (endpoint.includes('/portal/confirm-payment')) {
    // Validate invoice exists
    if (!portalMeta?.invoice) {
      return { ok: false, error: 'No invoice found' };
    }
    
    const amount = body?.amount || 650;
    const currentPaid = portalMeta.invoice.paid || 0;
    const currentTotal = portalMeta.invoice.total || 0;
    const remainingBalance = currentTotal - currentPaid;
    
    // Cap payment amount to remaining balance to prevent negative balance
    const actualAmount = Math.min(amount, Math.max(0, remainingBalance));
    const newPaid = currentPaid + actualAmount;
    const newBalance = Math.max(0, currentTotal - newPaid);
    
    return {
      ok: true,
      payment: {
        id: 'pay-' + Date.now(),
        amount: actualAmount,
        status: 'completed',
        timestamp,
      },
      invoice: {
        paid: newPaid,
        balance: newBalance,
        status: newBalance > 0 ? 'part_paid' : 'paid',
      },
    };
  }
  
  if (endpoint.includes('/portal/reject')) {
    return {
      ok: true,
      quote: {
        status: 'rejected',
        rejectedAt: timestamp,
      },
    };
  }
  
  // Admin endpoints
  if (endpoint.includes('/admin/estimates') && endpoint.includes('/send')) {
    return {
      ok: true,
      message: 'Estimate sent successfully',
      sentAt: timestamp,
      externalSystems: {
        wordpress: {
          status: 'completed',
          action: 'Update meta status',
          details: {
            status: 'sent',
            sentAt: timestamp,
          },
        },
        ghl: {
          status: 'completed',
          action: 'Update estimate status',
          details: {
            status: 'sent',
            sentAt: timestamp,
          },
        },
        email: {
          status: 'completed',
          action: 'Send email',
          details: {
            sent: true,
            recipient: portalMeta?.account?.email || 'customer@example.com',
          },
        },
      },
    };
  }
  
  if (endpoint.includes('/admin/estimates') && endpoint.includes('/complete-review')) {
    return {
      ok: true,
      workflow: {
        status: 'reviewed',
        reviewedAt: timestamp,
      },
      photos: {
        reviewed: true,
        reviewed_at: timestamp,
        reviewed_by: 1, // Admin user ID
      },
      quote: {
        acceptance_enabled: true,
        enabled_at: timestamp,
        enabled_by: 1,
      },
    };
  }
  
  if (endpoint.includes('/admin/estimates') && endpoint.includes('/enable-acceptance')) {
    return {
      ok: true,
      quote: {
        acceptance_enabled: true,
        enabled_at: timestamp,
        enabled_by: 1,
      },
      workflow: {
        status: 'reviewed',
        reviewedAt: timestamp,
      },
    };
  }
  
  if (endpoint.includes('/admin/estimates') && endpoint.includes('/set-photos-required')) {
    return {
      ok: true,
      photos_required: body?.photos_required ?? false,
    };
  }
  
  if (endpoint.includes('/admin/estimates') && endpoint.includes('/create-invoice')) {
    return {
      ok: true,
      invoice: {
        id: 'inv-' + Date.now(),
        number: 'INV-' + Math.floor(Math.random() * 1000),
        status: 'created',
        total: 650,
        paid: 0,
        balance: 650,
        created_at: timestamp,
      },
    };
  }
  
  // Quote request
  if (endpoint.includes('/quote-request') || endpoint.includes('/estimate/create')) {
    const estimateId = 'est-' + Date.now();
    return {
      ok: true,
      estimateId,
      portalUrl: `http://localhost:3000/portal?estimateId=${estimateId}&inviteToken=abc123`,
      externalSystems: {
        wordpress: {
          status: 'completed',
          action: 'Initialize portal meta',
          details: {
            estimateId,
            status: 'initialized',
          },
        },
        ghl: {
          status: 'completed',
          action: 'Create draft estimate',
          details: {
            estimateId: 'ghl-est-' + Date.now(),
            status: 'draft',
            number: 'EST-' + Math.floor(Math.random() * 1000),
          },
        },
      },
    };
  }
  
  // Default response
  return {
    ok: true,
    message: 'Action completed',
    timestamp,
  };
}

export function getApiCallDetails(endpoint, method, body, response, duration = null) {
  return {
    timestamp: new Date().toLocaleTimeString(),
    method,
    endpoint,
    request: {
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': 'mock-nonce-123',
      },
      body,
    },
    response: {
      status: response.ok ? 200 : 400,
      body: response,
    },
    duration: duration ? `${duration}ms` : null,
  };
}


