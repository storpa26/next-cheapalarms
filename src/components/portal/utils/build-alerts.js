import { formatCurrency } from "./portal-utils";

/**
 * Builds alert items from portal view data
 */
export function buildAlerts(view, payments) {
  if (!view) return [];
  const items = [];
  const missing = view.photos?.missingCount ?? 0;
  if (missing > 0) {
    items.push({
      id: "photos",
      title: `${missing} photo${missing === 1 ? "" : "s"} missing`,
      description: "Upload the remaining site photos so we can prepare for installation.",
      actionLabel: "Add photos",
      section: "photos",
    });
  }
  if (!view.quote?.acceptedAt) {
    items.push({
      id: "estimate",
      title: "Estimate awaiting approval",
      description: "Review and accept your proposal to move forward with installation.",
      actionLabel: "Review estimate",
      section: "estimate",
    });
  }
  const outstanding = payments?.outstanding ?? 0;
  if (outstanding > 0) {
    items.push({
      id: "payments",
      title: "Payment due",
      description: `${formatCurrency(outstanding)} outstanding balance ready to pay.`,
      actionLabel: "Pay now",
      section: "payments",
    });
  }
  return items;
}

