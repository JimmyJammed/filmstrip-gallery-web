import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#gallery").scrollIntoViewIfNeeded();
});
test("loops, pauses and resumes without duplicate accessible controls", async ({
  page,
}) => {
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
  await expect(page.locator(".fg-frame:not([data-clone])")).toHaveCount(6);
  const start = await page
    .locator(".fg-track")
    .evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() =>
      page
        .locator(".fg-track")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(start);
  await page.getByRole("button", { name: "Pause film", exact: true }).click();
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "false");
  const frozen = await page
    .locator(".fg-track")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(150);
  expect(
    await page
      .locator(".fg-track")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe(frozen);
  await page.getByRole("button", { name: "Play film", exact: true }).click();
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
  expect(
    await page
      .locator("[data-clone]")
      .evaluateAll((els) =>
        els.every(
          (el) =>
            el.getAttribute("aria-hidden") === "true" &&
            el.getAttribute("tabindex") === "-1",
        ),
      ),
  ).toBe(true);
});
test("keyboard opens, navigates, escapes and restores visible focus", async ({
  page,
}) => {
  const frame = page.locator(".fg-frame:not([data-clone])").last();
  await frame.focus();
  await expect(page.locator(".fg")).not.toHaveAttribute("data-loop", "");
  const visible = await frame.evaluate((el) => {
    const a = el.getBoundingClientRect(),
      b = el.parentElement!.parentElement!.getBoundingClientRect();
    return a.left >= b.left - 1 && a.right <= b.right + 1;
  });
  expect(visible).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".fg-nav p")).toContainText("6 / 6");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".fg-nav p")).toContainText("1 / 6");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(frame).toBeFocused();
});
test("reduced motion stays scrollable and lightbox remains available", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-clone]")).toHaveCount(0);
  await expect(page.locator(".fg-gate")).toHaveCSS("overflow-x", "auto");
  await expect(page.locator(".fg-toggle")).toBeDisabled();
  await page.locator(".fg-frame").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
test("Save-Data avoids importing GSAP and preserves images", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true, addEventListener() {} },
    }),
  );
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.reload();
  await expect(page.locator(".fg-toggle")).toBeDisabled();
  await expect(page.locator("[data-clone]")).toHaveCount(0);
  expect(requests.some((url) => /gsap/.test(url))).toBe(false);
});
test("empty, single and short tracks survive resizing", async ({ page }) => {
  await page.evaluate(() => {
    const w = window as any;
    w.filmstrip.update({
      items: w.demoOptions.items.slice(0, 2),
      frameHeight: 100,
    });
  });
  await expect(page.locator(".fg")).toHaveAttribute("data-loop", "");
  expect(
    await page
      .locator(".fg-track")
      .evaluate(
        (el) =>
          el.getBoundingClientRect().width >=
          el.parentElement!.clientWidth +
            [...el.querySelectorAll(".fg-frame:not([data-clone])")].reduce(
              (sum, item) => sum + item.getBoundingClientRect().width,
              0,
            ),
      ),
  ).toBe(true);
  await page.setViewportSize({ width: 1700, height: 1000 });
  await expect
    .poll(() =>
      page
        .locator(".fg-track")
        .evaluate(
          (el) =>
            el.getBoundingClientRect().width >=
            el.parentElement!.clientWidth +
              [...el.querySelectorAll(".fg-frame:not([data-clone])")].reduce(
                (sum, item) => sum + item.getBoundingClientRect().width,
                0,
              ),
        ),
    )
    .toBe(true);
  await page.evaluate(() => {
    const w = window as any;
    w.filmstrip.update({ items: w.demoOptions.items.slice(0, 1) });
  });
  await expect(page.locator("[data-clone]")).toHaveCount(0);
  await expect(page.locator(".fg-frame")).toHaveCount(1);
  await page.evaluate(() => (window as any).filmstrip.update({ items: [] }));
  await expect(page.getByText("No images yet.")).toBeVisible();
});
test("instances isolate state and repeated init restores host content", async ({
  page,
}) => {
  await page.evaluate(() => {
    const w = window as any;
    const root = document.createElement("div");
    root.id = "second";
    root.textContent = "Original content";
    document.querySelector(".reel")!.append(root);
    w.second = w.createFilmstripGallery(root, w.demoOptions);
  });
  await expect(page.locator("#second .fg")).toHaveCount(1);
  await page.evaluate(() => (window as any).filmstrip.destroy());
  await expect(page.locator("#gallery .fg")).toHaveCount(0);
  await expect(page.locator("#second .fg-frame:not([data-clone])")).toHaveCount(
    6,
  );
  await page.evaluate(() => {
    const w = window as any;
    w.second = w.createFilmstripGallery(
      document.querySelector("#second"),
      w.demoOptions,
    );
    w.second.destroy();
    w.second.destroy();
  });
  await expect(page.locator("#second")).toHaveText("Original content");
});
test("offscreen and document visibility pause playback", async ({ page }) => {
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "false");
  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "false");
});
test("playground edits export safely and resets", async ({ page }) => {
  await page
    .getByLabel("Caption 1", { exact: true })
    .fill("<b>New caption</b>");
  await page.getByLabel("Caption 1", { exact: true }).blur();
  await expect(page.locator("#code")).toContainText("<b>New caption</b>");
  await expect(page.locator("#images b")).toHaveCount(0);
  await page.getByLabel("Direction", { exact: true }).selectOption("right");
  await expect(page.locator("#code")).toContainText('"direction": "right"');
  await page
    .getByRole("button", { name: "Remove image 1", exact: true })
    .click();
  await expect(page.locator(".image-row")).toHaveCount(5);
  await page.getByRole("button", { name: "Reset to original" }).click();
  await expect(page.locator(".image-row")).toHaveCount(6);
});
test("broken images retain accessible labels and controls", async ({
  page,
}) => {
  await page.evaluate(() =>
    (window as any).filmstrip.update({
      items: [{ id: "bad", src: "/missing.jpg", alt: "Unavailable landscape" }],
    }),
  );
  await expect(
    page.getByRole("button", { name: "View full size: Unavailable landscape" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View full size: Unavailable landscape" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
});
test("React Strict Mode mounts and unmounts without duplicate galleries", async ({
  page,
}) => {
  await page.goto("/examples/react.html");
  await expect(page.locator(".fg")).toHaveCount(1);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Toggle gallery" }).click();
    await expect(page.locator(".fg")).toHaveCount(0);
    await page.getByRole("button", { name: "Toggle gallery" }).click();
    await expect(page.locator(".fg")).toHaveCount(1);
  }
  await expect(page.locator(".fg-frame:not([data-clone])")).toHaveCount(3);
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});
test("pointer opens a moving frame and local files export as placeholders", async ({
  page,
}) => {
  await page
    .locator(".fg-frame:not([data-clone])")
    .first()
    .click({ force: true });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("#upload").setInputFiles({
    name: "test.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>',
    ),
  });
  await expect(page.locator(".image-row")).toHaveCount(7);
  await expect(page.locator("#code")).toContainText("/images/");
  await expect(page.locator("#code")).not.toContainText("blob:");
});
test("loop coverage survives a full cycle and preference changes", async ({
  page,
}) => {
  await page.evaluate(() => {
    const w = window as any;
    w.filmstrip.update({
      items: w.demoOptions.items.slice(0, 2),
      secondsPerFrame: 1,
      frameHeight: 100,
    });
  });
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
  for (let i = 0; i < 8; i++) {
    expect(
      await page.locator(".fg-track").evaluate((el) => {
        const track = el.getBoundingClientRect(),
          gate = el.parentElement!.getBoundingClientRect();
        return track.left <= gate.left + 1 && track.right >= gate.right - 1;
      }),
    ).toBe(true);
    await page.waitForTimeout(300);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-clone]")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".fg")).toHaveAttribute("data-playing", "true");
});

test("lightbox-free galleries allow keyboard scrolling", async ({ page }) => {
  await page.evaluate(() =>
    (window as any).filmstrip.update({ lightbox: false }),
  );
  const gate = page.getByLabel("Scroll gallery images", { exact: true });
  await gate.focus();
  await expect(page.locator("[data-clone]")).toHaveCount(0);
  await expect(gate).toHaveCSS("overflow-x", "auto");
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => gate.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
});
