# Getting started

Use Node 22.18+ and npm. Run `npm ci`, then `npm run dev`. Open Vite's printed URL.

`npm run build` creates the static demo in `dist/` and the library in `dist/library/`. `npm run preview` serves the production demo. `npm run pack:library` produces the GitHub-release tarball in `artifacts/`.

Install the tarball in a separate application, import the core and CSS as shown in the README, and mount after your root element exists. Destroy the instance before removing its host. The component temporarily replaces host children and restores them on destroy. Do not edit the generated subtree directly.

The included `examples/react.html` runs the adapter under React Strict Mode. `examples/vanilla.ts` shows consumer imports. Any modern bundler that understands ESM and CSS asset URLs can consume the package.

To check locally: `npm run lint`, `npm run build`, `npm test`, `npm run verify:consumers`, and `npm run test:browser`. Install browsers with `npx playwright install` if needed.
