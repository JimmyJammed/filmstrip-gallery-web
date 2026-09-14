# Architecture and extraction

The original Stranger Court implementation lives in the portfolio's `site/src/scripts/main.ts` and `site/src/styles/global.css`. It shared a global lightbox pause callback, document-level selectors, and an asymmetric fade tied to the portfolio's vertical filament. This package removes those couplings. The existing portfolio implementation is intentionally not replaced.

Each factory owns its DOM, dialog, listeners, observer instances, optional tween, and generation counter. GSAP core is dynamically imported only when motion is allowed. IntersectionObserver handles viewport visibility; ResizeObserver rebuilds distances on container changes. No ScrollTrigger or global GSAP configuration is required.

A loop covers one original sequence. Copies fill at least the viewport plus one complete loop distance, even for two short frames in a wide container. Resize retains normalized loop progress. Async generation checks prevent stale imports from installing tweens after an update or destroy.

Keyboard interaction removes copies and transforms, making every original reachable in a native horizontal scroller. Leaving keyboard interaction rebuilds the reel. Manual pause intent is independent from visibility, dialog, and preference gates.

`src/types.ts` owns public data and normalization; `src/index.ts` owns browser behavior; `src/react.tsx` is a lifecycle adapter. The demo edits normal option objects and never forms a runtime dependency of the library.
