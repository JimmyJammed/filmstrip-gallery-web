import { useEffect, useRef } from "react";
import { createFilmstripGallery } from "./index";
import type { FilmstripGalleryController, FilmstripOptions } from "./types";
export function FilmstripGallery({
  options,
  className,
}: {
  options: FilmstripOptions;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null),
    controller = useRef<FilmstripGalleryController | null>(null);
  useEffect(() => {
    controller.current = createFilmstripGallery(root.current!, options);
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    controller.current?.update(options);
  }, [options]);
  return <div ref={root} className={className} />;
}
