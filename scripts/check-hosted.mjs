import { chromium, webkit, devices } from "@playwright/test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
const url =
  process.argv[2] || "https://hickman.biz/portfolio/filmstrip-gallery";
for (const [engine, settings, name] of [
  [chromium, { viewport: { width: 1440, height: 1000 } }, "desktop"],
  [webkit, { ...devices["iPhone 13"] }, "mobile"],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage(settings);
    const errors = [];
    const failures = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.url().startsWith(new URL(url).origin) && r.status() >= 400)
        failures.push(`${r.status()} ${r.url()}`);
    });
    const response = await page.goto(url);
    assert.equal(response.status(), 200);
    await page.locator("#gallery .fg-frame").first().waitFor();
    await page.reload();
    await page.locator("#gallery").scrollIntoViewIfNeeded();
    await page
      .locator(".fg-frame:not([data-clone])")
      .first()
      .click({ force: true });
    assert.equal(await page.locator("dialog").evaluate((el) => el.open), true);
    await page.keyboard.press("ArrowRight");
    assert.match(await page.locator(".fg-nav p").textContent(), /2 \/ 6/);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log(
      `PASS hosted ${name}: HTTP 200, reload, image viewer navigation, Escape, mobile width, no failed requests or page errors`,
    );
  } finally {
    await browser.close();
  }
}

const files = [
  "index.html",
  ...["assets", "samples"].flatMap((dir) =>
    readdirSync(`dist/${dir}`).map((name) => `${dir}/${name}`),
  ),
];
for (const file of files) {
  const response = await fetch(`${url.replace(/\/$/, "")}/${file}`);
  assert.equal(response.status, 200, file);
  const actual = Buffer.from(await response.arrayBuffer());
  assert.equal(
    createHash("sha256").update(actual).digest("hex"),
    createHash("sha256")
      .update(readFileSync(`dist/${file}`))
      .digest("hex"),
    file,
  );
}
console.log(
  `PASS hosted artifact: ${files.length} files match the local production build byte-for-byte`,
);
