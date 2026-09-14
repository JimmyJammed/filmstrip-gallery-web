export interface FilmstripItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  fullSrc?: string;
}
export interface FilmstripOptions {
  items: FilmstripItem[];
  label?: string;
  frameHeight?: number;
  secondsPerFrame?: number;
  direction?: "left" | "right";
  autoplay?: boolean;
  edgeFade?: number;
  lightbox?: boolean;
}
export interface FilmstripGalleryController {
  update(options: Partial<FilmstripOptions>): void;
  pause(): void;
  play(): void;
  destroy(): void;
}
export function normalize(
  options: FilmstripOptions,
): Required<FilmstripOptions> {
  const ids = new Set<string>();
  for (const item of options.items) {
    if (!item.id || ids.has(item.id))
      throw new Error("Image IDs must be nonempty and unique.");
    ids.add(item.id);
    if (!item.src || typeof item.alt !== "string")
      throw new Error("Each image needs src and alt.");
    for (const src of [item.src, item.fullSrc].filter(Boolean) as string[]) {
      if (/^\s*(javascript|vbscript):/i.test(src))
        throw new Error("Unsupported image URL.");
    }
  }
  const bounded = (
    v: number | undefined,
    fallback: number,
    min: number,
    max: number,
  ) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v!)) : fallback);
  return {
    items: options.items.map((item) => ({ ...item })),
    label: options.label ?? "Filmstrip gallery",
    frameHeight: bounded(options.frameHeight, 240, 80, 600),
    secondsPerFrame: bounded(options.secondsPerFrame, 6, 1, 60),
    direction: options.direction === "right" ? "right" : "left",
    autoplay: options.autoplay ?? true,
    edgeFade: bounded(options.edgeFade, 48, 0, 200),
    lightbox: options.lightbox ?? true,
  };
}
