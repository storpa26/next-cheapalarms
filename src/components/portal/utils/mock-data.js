/**
 * Mock data functions for portal development/testing
 */

export function mockPortalStatus(estimateId, locationId) {
  return {
    estimateId,
    locationId,
    nextStep: "Our team will confirm shortly.",
    quote: {
      status: "pending",
      statusLabel: "Awaiting approval",
      number: estimateId,
      acceptedAt: null,
    },
    account: {
      status: "pending",
      statusLabel: "Invite pending",
      lastInviteAt: null,
      expiresAt: null,
      portalUrl: null,
      resetUrl: null,
    },
    installation: {
      status: "pending",
      statusLabel: "Not scheduled",
      message: "We'll confirm your installation window once photos are reviewed.",
      canSchedule: false,
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      timeline: mockTimelineSteps(),
    },
    photos: {
      items: [],
      missingCount: 6,
      required: 6,
      samples: mockSamplePhotos(),
    },
    payments: mockPaymentHistory(),
    documents: mockDocumentList(),
    tasks: mockTaskList(),
    support: mockSupportInfo(),
    activity: mockActivityLog(),
  };
}

export function mockTimelineSteps() {
  return [
    {
      id: "request",
      title: "Quote requested",
      description: "Thanks for reaching out—your request is in our system.",
      when: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      complete: true,
    },
    {
      id: "photos",
      title: "Photos received",
      description: "We're reviewing your site photos to finalise the proposal.",
      when: null,
      complete: false,
    },
    {
      id: "schedule",
      title: "Book installation",
      description: "We'll send a scheduling link as soon as your proposal is accepted.",
      when: null,
      complete: false,
    },
  ];
}

export function mockSamplePhotos() {
  return [
    {
      id: "ceiling",
      title: "Ceiling overview",
      description: "A wide shot of the area where you'd like the detector installed.",
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "switchboard",
      title: "Switchboard",
      description: "Include the door open so we can see the interior layout.",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "existing",
      title: "Existing detector",
      description: "If you already have a system installed, show us what's there.",
      url: "https://images.unsplash.com/photo-1523419409543-0c1df022bddb?auto=format&fit=crop&w=800&q=60",
    },
  ];
}

export function mockPaymentHistory() {
  return {
    outstanding: 129900,
    history: [
      {
        id: "deposit",
        label: "Deposit received",
        amount: 50000,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: "invoice",
        label: "Invoice issued",
        amount: 129900,
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  };
}

export function mockDocumentList() {
  return [
    {
      id: "proposal",
      title: "Installation proposal",
      type: "proposal",
      signed: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: "contract",
      title: "Customer agreement",
      type: "contract",
      signed: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
  ];
}

export function mockTaskList() {
  return [
    {
      id: "confirm-date",
      title: "Confirm installation date",
      description: "Choose a preferred day so we can lock in the technician.",
    },
    {
      id: "upload-meter",
      title: "Upload meter photo",
      description: "A clear shot helps us confirm compatibility before arrival.",
    },
    {
      id: "access",
      title: "Access instructions",
      description: "Let us know if there's a gate code or special entry details.",
    },
  ];
}

export function mockSupportInfo() {
  return {
    specialist: {
      name: "Jordan Reeves",
      role: "Customer success",
      bio: "Your point of contact for installation updates and questions.",
      phone: "1300 000 111",
      email: "support@cheapalarms.com.au",
    },
  };
}

export function mockActivityLog() {
  return [
    {
      id: "invite",
      title: "Portal invite sent",
      description: "An invite email was delivered to admin@cheapalarms.com.au",
      when: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: "estimate",
      title: "Estimate reviewed",
      description: "Our team is preparing the detailed estimate for your site.",
      when: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "photos",
      title: "Waiting on site photos",
      description: "Send through the requested photos or tap Skip to continue without them.",
      when: new Date().toISOString(),
    },
  ];
}

