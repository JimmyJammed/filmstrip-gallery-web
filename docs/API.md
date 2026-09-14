# API

## Core

`createFilmstripGallery(root: HTMLElement, options: FilmstripOptions): FilmstripGalleryController`

Call in a browser after mounting the host. Importing the module is safe during server rendering; invoking the factory requires DOM APIs. A second factory call on the same root destroys the previous instance first.

| Option | Default | Meaning |
| --- | --- | --- |
| `items` | required | Array of `{ id, src, alt, caption?, fullSrc? }` |
| `label` | `Filmstrip gallery` | Accessible region label |
| `frameHeight` | `240` | Photo height in CSS pixels, clamped 80–600 and responsive to viewport width |
| `secondsPerFrame` | `6` | Seconds per frame of loop distance; clamped 1–60 |
| `direction` | `left` | `left` or `right` |
| `autoplay` | `true` | Initial play intent; preferences and visibility still gate motion |
| `edgeFade` | `48` | Symmetric fade in pixels, clamped 0–200; removed in manual mode |
| `lightbox` | `true` | Make frames open the native image dialog |

IDs must be nonempty and unique. `src` must be nonempty and `alt` a string. Use empty alt only for genuinely decorative images. Invalid identities throw before changing an existing instance. Image URLs are consumer-owned; script schemes are rejected. Browser image loading handles network failures. Text uses DOM text properties, not HTML parsing.

Methods:

- `update(patch: Partial<FilmstripOptions>)`: merge options, replace `items` as a whole, close any open lightbox, and rebuild. An explicit autoplay patch resets play intent.
- `pause()`: retain a user pause until `play()` or an explicit autoplay update.
- `play()`: request playback; never bypass motion preferences, keyboard navigation, hidden tab, offscreen state, or an open dialog.
- `destroy()`: idempotently release resources and restore original host children. Further calls to other methods are no-ops.

Empty collections show an empty state. Single images never loop. Lightbox navigation wraps through originals only. With no native dialog support, opening a frame opens its full-size URL in a new tab.

## React

```tsx
import { FilmstripGallery } from 'filmstrip-gallery/react';
import 'filmstrip-gallery/styles.css';
<FilmstripGallery options={options} className="my-gallery" />
```

Supports React 18 and 19. Props are `options` and optional `className`. Treat options as immutable; pass a new object to update. The adapter mounts once, updates options, and destroys on unmount. Core imports have no React dependency. The host renders an empty div on the server and mounts client-side.

## Package exports

`filmstrip-gallery`, `filmstrip-gallery/react`, `filmstrip-gallery/styles.css`, and `filmstrip-gallery/assets/film-frame.svg`. ESM with TypeScript declarations; CSS resolves its asset relative to the installed package.
