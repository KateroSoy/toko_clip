# Vercel build fix

Fixes applied after the Vercel build failure on `lib/openshorts.mjs`:

1. Added `lib/openshorts.d.mts` so TypeScript can resolve the `.mjs` module with strict type checking.
2. Added explicit `ChangeEvent<HTMLInputElement>` types to form handlers.
3. Replaced CSS `align-items: end` with `align-items: flex-end` to remove the Autoprefixer warning.
4. Upgraded runtime dependencies to patched versions:
   - Next.js 15.5.9
   - React 19.1.5
   - React DOM 19.1.5

Validation performed locally:

- TypeScript project syntax/type pass using isolated framework stubs.
- Exact `.mjs` -> `.d.mts` module declaration resolution pass with TypeScript 5.8.3.
- Production secret scan: OpenShorts API key is not present in the deployable project.

The sandbox environment cannot download npm packages reliably, so the final `next build` must run in Vercel after pushing these changes. Vercel's previous log already confirmed dependency installation works in its build environment.
