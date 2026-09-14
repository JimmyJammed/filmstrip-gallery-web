# Deployment results — 2026-09-14

- Live demo: https://hickman.biz/portfolio/filmstrip-gallery
- Portfolio listing: https://hickman.biz/portfolio
- Repository: https://github.com/JimmyJammed/filmstrip-gallery-web
- Component PR: https://github.com/JimmyJammed/filmstrip-gallery-web/pull/1
- Portfolio PR: https://github.com/Falcon-Forged/hickman-portfolio-website/pull/72 (merged)
- Portfolio merge revision: `c24496bef7e3fee90ec703b14620af3921d89c15`
- Production deployment: `dpl_4KdEyFgocGHkNeBNV6fMGgqkjQUG` — READY
- Deployment URL: https://hickman-portfolio-fkadxkbzq-jhickman707-3263s-projects.vercel.app
- Prior production deployment retained as a rollback candidate: https://hickman-portfolio-pn00hjl2b-jhickman707-3263s-projects.vercel.app

`npm run verify:hosted` passed for desktop Chromium and mobile WebKit: HTTP 200, reload, image viewer navigation, Escape, width containment, and no failed same-origin requests or page errors. All 11 deployed runtime files match the locally built artifact byte-for-byte (SHA-256).

Only demo runtime files were copied to the host. No library archive, source maps, or example-only React bundle was deployed. The portfolio owns the clean-URL rewrite. Its existing Stranger Court component remains unchanged. Existing uncommitted work in the original portfolio checkout was preserved; implementation and merge used an isolated checkout.

Reproduce the check with `DEMO_BASE=/portfolio/filmstrip-gallery/ npm run build`, then `npm run verify:hosted`. The verifier compares against that local build, so run it from the corresponding release revision.

For rollback, use Vercel's existing promotion/rollback controls with the retained deployment after checking for newer unrelated production changes. No repository-wide protection, billing, or DNS settings were changed.
