let cachedNonce = null;
let pendingPromise = null;

export async function getWpNonce(options = {}) {
  const { inviteToken, estimateId } = options;
  const cacheKey = inviteToken && estimateId ? `${estimateId}:${inviteToken}` : 'auth';

  if (cachedNonce && cachedNonce.key === cacheKey) return cachedNonce.value;
  if (pendingPromise && pendingPromise.key === cacheKey) return pendingPromise.value;

  pendingPromise = {
    key: cacheKey,
    value: (async () => {
      const params = [];
      if (inviteToken) params.push(`inviteToken=${encodeURIComponent(inviteToken)}`);
      if (estimateId) params.push(`estimateId=${encodeURIComponent(estimateId)}`);
      const qs = params.length ? `?${params.join('&')}` : '';

      const resp = await fetch(`/api/auth/nonce${qs}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));
      pendingPromise = null;
      if (!resp.ok || !data?.nonce) {
        cachedNonce = null;
        const err = new Error(data?.error || 'Failed to fetch nonce');
        err.code = resp.status === 401 || resp.status === 403 ? 'AUTH_REQUIRED' : 'NONCE_FETCH_FAILED';
        throw err;
      }
      cachedNonce = { key: cacheKey, value: data.nonce };
      return data.nonce;
    })(),
  };

  return pendingPromise.value;
}

export function clearNonceCache() {
  cachedNonce = null;
  pendingPromise = null;
}

export async function getWpNonceSafe(options = {}) {
  try {
    return await getWpNonce(options);
  } catch (e) {
    clearNonceCache();
    // Bubble to caller so they can prompt re-login on 401/403
    throw e;
  }
}

