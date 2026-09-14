# Customization

Use the playground to edit photo height, seconds per frame, direction, edge fade, autoplay, and lightbox behavior. Edit captions and alternative text independently; remove images or add local files. Reset revokes preview URLs and restores the bundled sample collection.

Copy code generates a complete factory call and cleanup example. Blob URLs are temporary and export as `/images/<id>.jpg` placeholders: copy your real files to your application's public folder and replace these paths. Nothing uploads to a server or persists across reloads.

The stylesheet uses `.fg-*` names to avoid collisions. The component inherits text color. Set the surrounding page background and typography in your app; the native dialog has its own dark surface. The original 4:3 photo window uses object-fit cover. Supply `fullSrc` for a different lightbox image.

The `assets/film-frame.svg` export is self-contained and may be reused under the notices in THIRD_PARTY_LICENSES.md. Changing tile proportions requires updating image-window positioning and the frame width/height ratios together.
