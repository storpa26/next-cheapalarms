export function getLoginRedirect(from) {
  if (!from) return '/login';
  return `/login?from=${encodeURIComponent(from)}`;
}

