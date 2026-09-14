# Validation — v0.1.0

Local verification on **2026-09-14**. Runtime source revision: `f451837693e0e622dbb9172cbc6d5ef1b1bbf6fa`. Later documentation-only commits do not change these tested source files; their hashes are recorded in [machine-readable evidence](validation-v0.1.0.json).

| Check | Result |
| --- | --- |
| Lint | Passed |
| TypeScript and demo/library production builds | Passed |
| Unit tests | 6 passed, 0 failed |
| Browser suite | 56 passed, 0 failed |
| Clean vanilla consumer | Install, declarations, assets and build passed; React absent |
| Clean React 18.3.1 consumer | Install, declarations and build passed |
| Clean React 19.1.1 consumer | Install, declarations and build passed |
| Package boundaries | 11 files; exports, asset and license notices verified |
| Portfolio build | Passed, including artifact checks |
| Portfolio route integration | 2 passed: desktop Chromium and mobile WebKit |
| Desktop/mobile visual review | Completed; previews committed |

Browser suite: 14 scenarios each in Chromium, Firefox, WebKit, and emulated iPhone 13 WebKit, using Playwright 1.63.0 on macOS. Node 26.7.0 was used locally; the documented minimum Node 22.18 was not separately exercised.

Coverage includes playback/pause, full-cycle coverage and short collections, resize, keyboard visibility, dialog navigation/Escape/focus restoration, motion preference changes, Save-Data without GSAP fetches, hidden/offscreen pausing, empty/single/broken images, independent instances/reinitialization, React Strict Mode, image uploads, text-safe exports, reset, mobile width, and keyboard scrolling with the lightbox disabled.

The source film-frame geometry and embedded texture were preserved, with neutral FG/FILMSTRIP GALLERY markings and symmetric fading. Desktop/mobile screenshots were visually inspected. The mobile code panel overflow discovered during review was fixed and regression-tested.

Initial checks found and corrected a direction label, a WebKit manual-scroll behavior, and the local clean-URL route. An overstrict loop-length test was corrected to require viewport plus one full loop distance. A run interrupted by development-server reload during formatting was rerun against stable source. Final suites above have no failures.

The sandbox initially blocked the local test server and npm cache writes; permitted local execution and a temporary cache resolved both. No checks remain blocked. No hosted Actions job or paid minutes were used. The portfolio build retains its existing large-Three.js-chunk warning.

## Limits

No physical-device or screen-reader certification is claimed. Mobile coverage is emulation. Document-hidden behavior is event-simulated in the automated suite. The browser supports native dialog, IntersectionObserver, ResizeObserver and modern ESM; unsupported image URLs remain consumer errors.

## Publication

The public route passed desktop/mobile checks and byte-for-byte verification of all 11 runtime files. See [deployment results](DEPLOYMENT-RESULTS.md).
