# Deployment

Build the hosted demo with:

```sh
DEMO_BASE=/portfolio/filmstrip-gallery/ npm run build
```

Copy only the demo `index.html`, `assets/`, and `samples/` into the portfolio host's `site/public/portfolio/filmstrip-gallery/`. Do not publish `dist/library/`, example pages, source maps, package staging, or release archives as demo files. The existing Vercel `hickman-portfolio` project owns hosting; no DNS changes or Actions jobs are needed.

The public route is `https://hickman.biz/portfolio/filmstrip-gallery`. Verify direct navigation, refresh, asset responses, configuration controls, and a lightbox open/close cycle. Record the source revision, file hashes, deployment URL, and previous production URL. Keep the prior deployment available for rollback.

Default builds support root hosting. Asset URLs follow Vite's base. Static hosts other than Vercel should serve index.html for the directory route. The component needs no API, account, backend, or telemetry endpoint.

Release v0.1.0 on GitHub with the packed tarball and SHA-256 checksum. No npm publication or automatic GitHub Actions workflow is configured.
