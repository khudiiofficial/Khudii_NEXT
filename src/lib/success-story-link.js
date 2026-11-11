/**
 * Normalize the optional Success Story destination without confusing it with its slug.
 * A path such as "about" becomes "/about"; absolute HTTP(S) links, including
 * YouTube video URLs, are allowed. Unsafe schemes and protocol-relative URLs aren't.
 */
export function normalizeSuccessStoryLink(input) {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { link: '' };
  const invalid = { error: 'Enter a valid internal path or an http(s) URL' };
  if (/[\u0000-\u001f\u007f\\<>\s]/.test(raw) || raw.startsWith('//')) return invalid;

  // Be forgiving when an editor pastes an ordinary domain without a scheme.
  const domain = /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\:\d+)?(?:[/?#]|$)/i.test(raw);
  const candidate = domain ? `https://${raw}` : raw;
  if (/^[a-z][a-z\d+.-]*:/i.test(candidate)) {
    let url;
    try { url = new URL(candidate); } catch { return invalid; }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return invalid;
    if (candidate.length > 255) return { error: 'Custom Link must be 255 characters or fewer' };
    return { link: candidate };
  }

  // Any colon in the path portion indicates a malformed/unsupported URI scheme.
  const pathPart = candidate.split(/[?#]/, 1)[0];
  if (pathPart.includes(':')) return invalid;
  const link = candidate.startsWith('/') ? candidate : `/${candidate}`;
  if (link.length > 255) return { error: 'Custom Link must be 255 characters or fewer' };
  return { link };
}
