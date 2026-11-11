/** Anonymous, best-effort usage metrics. Never send inputs, email addresses or URL query strings. */
export function trackKhudiiEvent(action, category, itemId = '') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('khudii:analytics', { detail: { action, category, itemId } }));
}
