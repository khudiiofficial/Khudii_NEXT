# Footer hydration fix

The three Next.js development-overlay entries came from two invalid HTML structures in:

`src/legacy/public/componets/secondlast/Footer.jsx`

## Corrected

- Removed the telephone `<a>` nested inside another telephone `<a>`.
- Removed the location `<a>` nested inside a wrapper `<a>`.
- Added `rel="noopener noreferrer"` to the external location link.
- Added accessible labels to the telephone and location links.
- Added `scripts/check-html-nesting.mjs` and `npm run check:html` to prevent nested anchors/buttons from returning.

## Validation

Run:

```bash
npm install
npm run verify
```

For an existing local checkout, delete `.next` and restart the development server after applying the fix:

```bash
rm -rf .next
npm run dev
```

The archive intentionally excludes `.env.local`. Keep credentials in your local environment or Vercel project settings.

## Edit organization render loop

- Memoized `useNavigate()` in `src/lib/router-compat.jsx` with `useCallback`.
- Prevents effects with `[navigate]` dependencies from re-running after every render.
- Removed render-time `console.log(form)` from the edit organization page.
- Added `npm run check:router` to the static verification gate.
