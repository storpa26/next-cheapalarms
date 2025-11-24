/**
 * Portal utility functions
 */

export function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return value;
  }
}

export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount / 100);
}

export function badgeVariant(status) {
  const normalized = (status ?? "").toLowerCase();
  if (["accepted", "active", "scheduled"].includes(normalized)) {
    return "secondary";
  }
  if (["declined", "rejected", "failed"].includes(normalized)) {
    return "destructive";
  }
  return "outline";
}

export function cookieHeader(req) {
  const cookie = req?.headers?.cookie;
  return cookie ? { Cookie: cookie } : {};
}

