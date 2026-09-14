import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const archive = resolve("artifacts/filmstrip-gallery-0.1.0.tgz");
assert.ok(existsSync(archive), "Run npm run pack:library first");
for (const reactVersion of [null, "18.3.1", "19.1.1"]) {
  const cwd = mkdtempSync(join(tmpdir(), "filmstrip-consumer-"));
  const run = (args) =>
    execFileSync("npm", args, {
      cwd,
      stdio: "pipe",
      env: {
        ...process.env,
        npm_config_cache: join(tmpdir(), "filmstrip-npm-cache"),
      },
    });
  try {
    writeFileSync(
      join(cwd, "package.json"),
      JSON.stringify({
        name: "clean-consumer",
        version: "1.0.0",
        private: true,
        type: "module",
      }),
    );
    run([
      "install",
      "--ignore-scripts",
      archive,
      "vite@6.4.3",
      "typescript@5.9.3",
      ...(reactVersion
        ? [
            `react@${reactVersion}`,
            `react-dom@${reactVersion}`,
            `@types/react@${reactVersion.startsWith("18") ? "18" : "19"}`,
            `@types/react-dom@${reactVersion.startsWith("18") ? "18" : "19"}`,
          ]
        : []),
    ]);
    const manifest = JSON.parse(
      readFileSync(
        join(cwd, "node_modules/filmstrip-gallery/package.json"),
        "utf8",
      ),
    );
    assert.equal(manifest.peerDependenciesMeta.react.optional, true);
    assert.ok(
      existsSync(
        join(cwd, "node_modules/filmstrip-gallery/assets/film-frame.svg"),
      ),
    );
    if (!reactVersion)
      assert.equal(
        existsSync(join(cwd, "node_modules/react")),
        false,
        "vanilla must not install React",
      );
    writeFileSync(
      join(cwd, "index.html"),
      '<div id="app"></div><script type="module" src="/main.tsx"></script>',
    );
    writeFileSync(
      join(cwd, "main.tsx"),
      reactVersion
        ? `import {createRoot} from 'react-dom/client';import {FilmstripGallery} from 'filmstrip-gallery/react';import 'filmstrip-gallery/styles.css';createRoot(document.querySelector('#app')!).render(<FilmstripGallery options={{items:[]}}/>);`
        : `import {createFilmstripGallery} from 'filmstrip-gallery';import 'filmstrip-gallery/styles.css';const gallery=createFilmstripGallery(document.querySelector<HTMLElement>('#app')!,{items:[]});gallery.update({direction:'right'});gallery.destroy();`,
    );
    writeFileSync(
      join(cwd, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          lib: ["ES2022", "DOM"],
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["main.tsx"],
      }),
    );
    run(["exec", "tsc", "--", "--noEmit"]);
    run(["exec", "vite", "--", "build"]);
    console.log(
      `PASS clean ${reactVersion ? `React ${reactVersion}` : "vanilla (no React)"} install, exports, declarations, CSS asset, production build`,
    );
  } catch (error) {
    console.error(error.stdout?.toString(), error.stderr?.toString());
    throw error;
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
