import { createFilmstripGallery } from "../src";
import type { FilmstripItem, FilmstripOptions } from "../src";
import "../src/styles.css";
import "./style.css";
const names = [
  "Blue hour",
  "Last light",
  "Quiet country",
  "Desert study",
  "Northern passage",
  "The long way home",
];
const defaults: FilmstripOptions = {
  items: names.map((caption, i) => ({
    id: `scene-${i + 1}`,
    src: `${import.meta.env.BASE_URL}samples/landscape-${i + 1}.svg`,
    alt: `Original landscape illustration: ${caption.toLowerCase()}`,
    caption,
  })),
  frameHeight: 240,
  secondsPerFrame: 6,
  direction: "left",
  autoplay: true,
  edgeFade: 48,
  lightbox: true,
};
let options: FilmstripOptions = structuredClone(defaults);
const urls = new Set<string>();
document.querySelector("#app")!.innerHTML = `
<header><a class="brand" href="#">FG<span> / FILMSTRIP GALLERY</span></a><a href="https://github.com/JimmyJammed/filmstrip-gallery-web">Source on GitHub ↗</a></header>
<main><section class="intro"><p class="eyebrow">OPEN SOURCE / V0.1.0 / WEB COMPONENT</p><h1>A little cinema<br>for the <em>web.</em></h1><div class="intro-bottom"><p>Give your images a reel of their own.<br>Tactile film, continuous motion, room to look closer.</p><span class="edition">35 MM FEEL.<br>ZERO PROJECTIONIST.</span></div></section>
<section class="reel" aria-label="Interactive gallery"><div class="reel-heading"><span>01 — THE CONTACT SHEET</span><span>SELECT A FRAME TO STEP INSIDE ↗</span></div><div id="gallery"></div></section>
<section class="workbench"><div class="panel-heading"><p class="eyebrow">02 — MAKE IT YOURS</p><h2>Same film.<br>Your direction.</h2><p>Try the controls. Swap the images.<br>Take the configuration with you.</p><button id="reset" class="quiet">Reset to original ↺</button></div>
<div class="controls"><label>Frame height <output id="height-value">240 px</output><input id="height" type="range" min="100" max="400" value="240"></label><label>Seconds per frame <output id="speed-value">6 s</output><input id="speed" type="range" min="1" max="20" value="6"></label><label>Edge fade <output id="fade-value">48 px</output><input id="fade" type="range" min="0" max="120" value="48"></label><label>Direction<select id="direction" aria-label="Direction"><option value="left">Left ←</option><option value="right">Right →</option></select></label><label class="check"><input type="checkbox" id="autoplay" checked> Autoplay</label><label class="check"><input type="checkbox" id="lightbox" checked> Open images in lightbox</label><label class="upload">+ Add your images<input id="upload" type="file" accept="image/*" multiple></label><p class="note">Your files stay in this browser. Nothing is uploaded.</p></div></section>
<section class="images-section"><div class="section-title"><h2>In the reel</h2><span>EDIT CAPTIONS & ALTERNATIVE TEXT</span></div><div id="images"></div></section>
<section class="code-section"><div><p class="eyebrow">03 — TAKE IT WITH YOU</p><h2>A small API.<br>A full picture.</h2><p>TypeScript core. Optional React adapter.<br>MIT licensed. Built to leave cleanly.</p><a href="https://github.com/JimmyJammed/filmstrip-gallery-web#run-locally">Read the documentation ↗</a></div><div><div class="code-heading"><span>YOUR CONFIGURATION</span><button id="copy">Copy code</button></div><pre><code id="code"></code></pre><p class="note">Local files export as placeholder paths. Copy your images to your application's public directory.</p></div></section></main><footer><span>FILMSTRIP GALLERY · BY JIMMY HICKMAN</span><a href="https://hickman.biz/portfolio">More experiments ↗</a><span>CODE & SAMPLE ART · MIT</span></footer>`;
const gallery = createFilmstripGallery(
  document.querySelector("#gallery")!,
  options,
);
function code() {
  document.querySelector("#code")!.textContent =
    `import { createFilmstripGallery } from 'filmstrip-gallery';\nimport 'filmstrip-gallery/styles.css';\n\nconst gallery = createFilmstripGallery(root, ${JSON.stringify({ ...options, items: options.items.map((item) => ({ ...item, src: item.src.startsWith("blob:") ? `/images/${item.id}.jpg` : item.src })) }, null, 2)});\n\n// On unmount\ngallery.destroy();`;
}
function apply() {
  gallery.update(options);
  code();
}
function images() {
  const list = document.querySelector("#images")!;
  list.replaceChildren();
  options.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "image-row";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "";
    const caption = document.createElement("input");
    caption.value = item.caption || "";
    caption.setAttribute("aria-label", `Caption ${index + 1}`);
    caption.addEventListener("change", () => {
      item.caption = caption.value;
      apply();
    });
    const alt = document.createElement("input");
    alt.value = item.alt;
    alt.setAttribute("aria-label", `Alternative text ${index + 1}`);
    alt.addEventListener("change", () => {
      item.alt = alt.value;
      apply();
    });
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove image ${index + 1}`);
    remove.addEventListener("click", () => {
      options.items.splice(index, 1);
      if (urls.delete(item.src)) URL.revokeObjectURL(item.src);
      apply();
      images();
    });
    row.append(img, caption, alt, remove);
    list.append(row);
  });
}
for (const [id, key, unit] of [
  ["height", "frameHeight", "px"],
  ["speed", "secondsPerFrame", "s"],
  ["fade", "edgeFade", "px"],
] as const) {
  document
    .querySelector<HTMLInputElement>("#" + id)!
    .addEventListener("input", (event) => {
      options[key] = Number((event.target as HTMLInputElement).value);
      document.querySelector("#" + id + "-value")!.textContent =
        `${options[key]} ${unit}`;
      apply();
    });
}
document.querySelector("#direction")!.addEventListener("change", (event) => {
  options.direction = (event.target as HTMLSelectElement).value as
    | "left"
    | "right";
  apply();
});
for (const key of ["autoplay", "lightbox"] as const)
  document.querySelector("#" + key)!.addEventListener("change", (event) => {
    options[key] = (event.target as HTMLInputElement).checked;
    apply();
  });
document.querySelector("#upload")!.addEventListener("change", (event) => {
  for (const file of (event.target as HTMLInputElement).files || []) {
    if (!file.type.startsWith("image/")) continue;
    const src = URL.createObjectURL(file);
    urls.add(src);
    const item: FilmstripItem = {
      id: crypto.randomUUID(),
      src,
      alt: file.name,
      caption: file.name,
    };
    options.items.push(item);
  }
  apply();
  images();
  (event.target as HTMLInputElement).value = "";
});
document.querySelector("#reset")!.addEventListener("click", () => {
  for (const url of urls) URL.revokeObjectURL(url);
  urls.clear();
  options = structuredClone(defaults);
  for (const [id, value] of [
    ["height", "240"],
    ["speed", "6"],
    ["fade", "48"],
    ["direction", "left"],
  ])
    document.querySelector<HTMLInputElement>("#" + id)!.value = value;
  for (const id of ["autoplay", "lightbox"])
    document.querySelector<HTMLInputElement>("#" + id)!.checked = true;
  document.querySelector("#height-value")!.textContent = "240 px";
  document.querySelector("#speed-value")!.textContent = "6 s";
  document.querySelector("#fade-value")!.textContent = "48 px";
  apply();
  images();
});
document.querySelector("#copy")!.addEventListener("click", async () => {
  const button = document.querySelector("#copy")!;
  try {
    await navigator.clipboard.writeText(
      document.querySelector("#code")!.textContent!,
    );
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select code to copy";
  }
});
images();
code();
if (import.meta.env.DEV)
  Object.assign(window, {
    filmstrip: gallery,
    createFilmstripGallery,
    demoOptions: options,
  });
window.addEventListener(
  "pagehide",
  () => {
    for (const url of urls) URL.revokeObjectURL(url);
    gallery.destroy();
  },
  { once: true },
);
