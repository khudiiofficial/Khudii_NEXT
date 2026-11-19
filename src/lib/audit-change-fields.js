/**
 * Privacy-safe recursive JSON field-path diffing.
 * Returns comma-separated changed field paths only (never raw values/PII/secrets).
 */
export function changedFieldPaths(before, after, max = 24) {
  const paths = [];

  function walk(a, b, prefix, depth) {
    if (paths.length >= max) return;
    if (a === b) return;
    if (depth >= 5 || !a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) {
      if (prefix) paths.push(prefix);
      return;
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length || JSON.stringify(a) !== JSON.stringify(b)) {
        if (prefix) paths.push(prefix);
      }
      return;
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (paths.length >= max) break;
      const next = prefix ? `${prefix}.${key}` : key;
      walk(a[key], b[key], next, depth + 1);
    }
  }

  walk(before || {}, after || {}, '', 0);
  return paths.slice(0, max).join(', ');
}
