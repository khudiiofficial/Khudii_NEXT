# Edit Organization Fix

## Root cause

`useNavigate()` in `src/lib/router-compat.jsx` returned a new function on every render.
`EditOrganizationPage` includes `navigate` in the organization-loading effect dependency array, so each state update caused the effect to execute again and re-fetch the organization indefinitely.

## Changes

- Memoized `useNavigate()` with React `useCallback`.
- Removed the render-time `console.log(form)` from `EditOrganizationPage.jsx`.
- Added `scripts/check-router-compat.mjs`.
- Added `npm run check:router` to `verify:static`.

## Local restart

Keep your existing `.env.local` outside the ZIP, then run:

```bash
rm -rf .next
npm install
npm run verify:static
npm run dev
```
