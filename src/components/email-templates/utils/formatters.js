/**
 * Shared formatters for email templates.
 * Preserve current output (USD) exactly; do not switch to AUD as part of refactor.
 */

/**
 * Format amount as USD currency (en-US locale).
 * Same behaviour as previous inline usage: no rounding or formatting changes.
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
