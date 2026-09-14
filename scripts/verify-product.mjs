import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const files = execFileSync(
  "tar",
  ["-tzf", "artifacts/filmstrip-gallery-0.1.0.tgz"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n");
for (const required of [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/react.js",
  "styles.css",
  "assets/film-frame.svg",
  "LICENSE",
  "THIRD_PARTY_LICENSES.md",
])
  assert.ok(files.includes(`package/${required}`), required);
assert.ok(
  !files.some((file) => /node_modules|\.map$|previews\/|demo\//.test(file)),
);
assert.ok(
  !/from ["']react/.test(readFileSync("dist/library/index.js", "utf8")),
);
assert.ok(
  !/STRANGER COURT|>SC</.test(
    readFileSync("src/assets/film-frame.svg", "utf8"),
  ),
);
for (const preview of ["desktop", "mobile"])
  assert.ok(existsSync(`previews/${preview}.png`));
console.log(
  `PASS ${files.length} package files, declared exports, optional React boundary, neutral frame labels, previews`,
);
