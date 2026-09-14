import { createFilmstripGallery } from "filmstrip-gallery";
import "filmstrip-gallery/styles.css";
const gallery = createFilmstripGallery(
  document.querySelector<HTMLElement>("#gallery")!,
  {
    items: [
      {
        id: "coast",
        src: "/images/coast.jpg",
        alt: "A quiet coastline at dusk",
      },
    ],
  },
);
// On unmount:
gallery.destroy();
