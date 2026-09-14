import { normalize } from "./types";
import type { FilmstripOptions, FilmstripGalleryController } from "./types";
export type {
  FilmstripItem,
  FilmstripOptions,
  FilmstripGalleryController,
} from "./types";
const instances = new WeakMap<HTMLElement, FilmstripGalleryController>();
export function createFilmstripGallery(
  root: HTMLElement,
  initial: FilmstripOptions,
): FilmstripGalleryController {
  let options = normalize(initial);
  instances.get(root)?.destroy();
  const previous = [...root.childNodes];
  const shell = document.createElement("section");
  shell.className = "fg";
  const gate = document.createElement("div");
  gate.className = "fg-gate";
  const track = document.createElement("div");
  track.className = "fg-track";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "fg-toggle";
  const status = document.createElement("span");
  status.className = "fg-status";
  const bar = document.createElement("div");
  bar.className = "fg-bar";
  bar.append(toggle, status);
  const dialog = document.createElement("dialog");
  dialog.className = "fg-dialog";
  dialog.setAttribute("aria-label", "Image viewer");
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close ×";
  close.className = "fg-close";
  const image = document.createElement("img");
  const caption = document.createElement("p");
  caption.setAttribute("aria-live", "polite");
  const prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "← Previous";
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "Next →";
  const nav = document.createElement("div");
  nav.className = "fg-nav";
  nav.append(prev, caption, next);
  dialog.append(close, image, nav);
  gate.append(track);
  shell.append(gate, bar, dialog);
  root.replaceChildren(shell);
  const abort = new AbortController();
  const signal = abort.signal;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (
    navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }
  ).connection;
  let gsap: (typeof import("gsap"))["gsap"] | undefined;
  let tween: ReturnType<(typeof import("gsap"))["gsap"]["to"]> | undefined;
  let disposed = false,
    visible = false,
    keyboard = false,
    paused = !options.autoplay,
    generation = 0,
    selected = 0;
  let opener: HTMLElement | null = null;
  let originals: HTMLElement[] = [];
  const denied = () => media.matches || !!connection?.saveData;
  function sync() {
    const running =
      !!tween &&
      !denied() &&
      !paused &&
      !keyboard &&
      visible &&
      !document.hidden &&
      !dialog.open;
    if (running) tween?.play();
    else tween?.pause();
    shell.dataset.playing = String(running);
    toggle.textContent = paused ? "Play film" : "Pause film";
    toggle.disabled = denied() || options.items.length < 2;
    status.textContent = denied()
      ? "Manual scrolling · motion preference respected"
      : keyboard
        ? "Paused for keyboard navigation"
        : options.items.length < 2
          ? `${options.items.length} images`
          : running
            ? "Reel running"
            : "Reel paused";
  }
  function clearMotion() {
    tween?.kill();
    tween = undefined;
    track.querySelectorAll("[data-clone]").forEach((el) => el.remove());
    if (gsap) gsap.set(track, { clearProps: "transform" });
    else track.style.removeProperty("transform");
    delete shell.dataset.loop;
  }
  async function build() {
    const token = ++generation;
    const progress = tween?.progress() ?? 0;
    clearMotion();
    sync();
    if (disposed || denied() || keyboard || options.items.length < 2) return;
    try {
      gsap ??= (await import("gsap")).gsap;
    } catch {
      if (!disposed) sync();
      return;
    }
    if (disposed || token !== generation || denied() || keyboard) return;
    const distance = originals.reduce(
      (sum, el) => sum + el.getBoundingClientRect().width,
      0,
    );
    if (distance <= 0 || gate.clientWidth === 0) return;
    // Enough complete copies to fill even a wide gate with a very short collection.
    const copies = Math.ceil(gate.clientWidth / distance) + 1;
    for (let copy = 0; copy < copies; copy++)
      for (const original of originals) {
        const clone = original.cloneNode(true) as HTMLElement;
        clone.dataset.clone = "";
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        track.append(clone);
      }
    gate.scrollLeft = 0;
    shell.dataset.loop = "";
    tween = gsap.fromTo(
      track,
      { x: options.direction === "left" ? 0 : -distance },
      {
        x: options.direction === "left" ? -distance : 0,
        duration: options.items.length * options.secondsPerFrame,
        ease: "none",
        repeat: -1,
        paused: true,
      },
    );
    tween.progress(progress);
    sync();
  }
  function render() {
    clearMotion();
    shell.setAttribute("aria-label", options.label);
    shell.style.setProperty("--fg-height", `${options.frameHeight}px`);
    shell.style.setProperty("--fg-fade", `${options.edgeFade}px`);
    originals = options.items.map((item, index) => {
      const el = document.createElement(options.lightbox ? "button" : "div");
      el.className = "fg-frame";
      el.dataset.index = String(index);
      if (el instanceof HTMLButtonElement) {
        el.type = "button";
        el.setAttribute(
          "aria-label",
          `View full size: ${item.caption || item.alt}`,
        );
        el.setAttribute("aria-haspopup", "dialog");
      }
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 1200;
      img.height = 900;
      el.append(img);
      return el;
    });
    track.replaceChildren(...originals);
    if (!originals.length) {
      const empty = document.createElement("p");
      empty.className = "fg-empty";
      empty.textContent = "No images yet.";
      track.append(empty);
    }
    void build();
  }
  function renderImage() {
    const item = options.items[selected];
    if (!item) return;
    image.src = item.fullSrc || item.src;
    image.alt = item.alt;
    caption.textContent = `${selected + 1} / ${options.items.length}${item.caption ? " — " + item.caption : ""}`;
    prev.hidden = next.hidden = options.items.length < 2;
  }
  function open(index: number, source: HTMLElement) {
    if (!options.lightbox || !options.items[index]) return;
    selected = index;
    opener = source.hasAttribute("data-clone") ? originals[index] : source;
    if (typeof dialog.showModal !== "function") {
      window.open(
        options.items[index].fullSrc || options.items[index].src,
        "_blank",
        "noopener",
      );
      return;
    }
    renderImage();
    dialog.showModal();
    close.focus();
    sync();
  }
  track.addEventListener(
    "click",
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-index]",
      );
      if (el) open(Number(el.dataset.index), el);
    },
    { signal },
  );
  track.addEventListener(
    "pointerdown",
    (event) => {
      if ((event.target as HTMLElement).closest("[data-index]"))
        event.preventDefault();
    },
    { signal },
  );
  track.addEventListener(
    "focusin",
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-index]",
      );
      if (!el) return;
      keyboard = true;
      ++generation;
      clearMotion();
      gate.scrollLeft = el.offsetLeft;
      sync();
    },
    { signal },
  );
  track.addEventListener(
    "focusout",
    () => {
      queueMicrotask(() => {
        if (disposed || track.contains(document.activeElement) || dialog.open)
          return;
        keyboard = false;
        void build();
      });
    },
    { signal },
  );
  const step = (amount: number) => {
    selected =
      (selected + amount + options.items.length) % options.items.length;
    renderImage();
  };
  prev.addEventListener("click", () => step(-1), { signal });
  next.addEventListener("click", () => step(1), { signal });
  close.addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          dialog.close();
      }
    },
    { signal },
  );
  dialog.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        step(event.key === "ArrowLeft" ? -1 : 1);
      }
    },
    { signal },
  );
  dialog.addEventListener(
    "close",
    () => {
      if (disposed) return;
      opener?.focus({ preventScroll: true });
      sync();
    },
    { signal },
  );
  toggle.addEventListener(
    "click",
    () => {
      paused = !paused;
      sync();
    },
    { signal },
  );
  document.addEventListener("visibilitychange", sync, { signal });
  media.addEventListener(
    "change",
    () => {
      void build();
    },
    { signal },
  );
  connection?.addEventListener(
    "change",
    () => {
      void build();
    },
    { signal },
  );
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  });
  io.observe(gate);
  const ro = new ResizeObserver(() => {
    void build();
  });
  ro.observe(gate);
  const controller: FilmstripGalleryController = {
    update(patch) {
      if (disposed) return;
      const updated = normalize({ ...options, ...patch });
      if (dialog.open) dialog.close();
      options = updated;
      if (patch.autoplay !== undefined) paused = !patch.autoplay;
      keyboard = false;
      render();
    },
    pause() {
      if (!disposed) {
        paused = true;
        sync();
      }
    },
    play() {
      if (!disposed) {
        paused = false;
        sync();
      }
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      ++generation;
      abort.abort();
      io.disconnect();
      ro.disconnect();
      clearMotion();
      if (dialog.open) dialog.close();
      root.replaceChildren(...previous);
      instances.delete(root);
    },
  };
  instances.set(root, controller);
  render();
  return controller;
}
