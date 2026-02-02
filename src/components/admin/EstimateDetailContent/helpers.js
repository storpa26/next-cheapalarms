/**
 * Pure helpers for EstimateDetailContent (status, date, currency display).
 * No item arrays, indices, or estimate-editing logic.
 */

/**
 * @param {string} displayStatus - Portal display status (e.g. ACCEPTED, ESTIMATE_SENT)
 * @returns {{ variant: string, label: string }}
 */
export function getStatusDisplay(displayStatus) {
  switch (displayStatus) {
    case "ACCEPTED":
    case "INVOICE_READY":
      return { variant: "success", label: "Accepted" };
    case "REJECTED":
      return { variant: "destructive", label: "Rejected" };
    case "PHOTOS_UNDER_REVIEW":
      return { variant: "info", label: "Under Review" };
    case "READY_TO_ACCEPT":
      return { variant: "success", label: "Ready to Accept" };
    case "CHANGES_REQUESTED":
      return { variant: "warning", label: "Changes Requested" };
    case "AWAITING_PHOTOS":
    case "PHOTOS_UPLOADED":
      return { variant: "info", label: "Awaiting Photos" };
    case "ESTIMATE_SENT":
    default:
      return { variant: "warning", label: "Sent" };
  }
}

/**
 * Format ISO date string as locale date-time; invalid/missing returns null.
 * @param {string | null | undefined} isoString
 * @returns {string | null}
 */
export function formatDateTime(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

/**
 * Format ISO date string as locale date only; invalid/missing returns fallback.
 * @param {string | null | undefined} isoString
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export function formatDateOnly(isoString, fallback = "N/A") {
  if (!isoString) return fallback;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
}

/**
 * Format numeric amount with currency for display (e.g. "AU$ 123.45").
 * @param {number | string | null | undefined} value
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrencyAmount(value, currency) {
  const num = Number(value);
  const amount = Number.isNaN(num) ? 0 : num;
  return `${currency} ${amount.toFixed(2)}`;
}
