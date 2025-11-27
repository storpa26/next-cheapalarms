import { mockSamplePhotos } from "./mock-data";

/**
 * Normalizes portal status data from API to consistent format
 */
export function normaliseStatus(status) {
  if (!status) return null;
  const quote = status.quote ?? {};
  const account = status.account ?? {};
  const installation = status.installation ?? {};
  const photos = status.photos ?? {};

  return {
    estimateId: status.estimateId ?? quote.number ?? null,
    locationId: status.locationId ?? null,
    nextStep: status.nextStep ?? installation.message ?? "We'll keep you posted.",
    quote: {
      status: quote.status ?? "pending",
      label: quote.statusLabel ?? "Awaiting approval",
      number: quote.number ?? status.estimateId ?? "—",
      acceptedAt: quote.acceptedAt ?? null,
    },
    account: {
      status: account.status ?? "pending",
      label: account.statusLabel ?? "Invite pending",
      lastInviteAt: account.lastInviteAt ?? null,
      expiresAt: account.expiresAt ?? null,
      portalUrl: account.portalUrl ?? null,
      resetUrl: account.resetUrl ?? null,
    },
    installation: {
      status: installation.status ?? "pending",
      label: installation.statusLabel ?? "Not scheduled",
      message: installation.message ?? null,
      canSchedule: installation.canSchedule ?? false,
      scheduledFor: installation.scheduledFor ?? null,
    },
    photos: {
      items: Array.isArray(photos.items) ? photos.items : [],
      missingCount:
        photos.missingCount ??
        Math.max(
          0,
          (photos.required ?? 0) - (Array.isArray(photos.items) ? photos.items.length : 0)
        ),
      required: photos.required ?? 6,
      samples: photos.samples ?? [],
    },
    payments: status.payments ?? null,
    documents: status.documents ?? null,
    tasks: status.tasks ?? null,
    support: status.support ?? null,
    activity: status.activity ?? null,
    timeline: installation.timeline ?? null,
  };
}

