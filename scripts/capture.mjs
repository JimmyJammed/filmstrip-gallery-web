import { chromium, devices } from "@playwright/test";
const browser = await chromium.launch();
for (const [name, settings] of [
  ["desktop", { viewport: { width: 1440, height: 1000 } }],
  ["mobile", { ...devices["iPhone 13"] }],
]) {
  const page = await browser.newPage(settings);
  await page.goto("http://127.0.0.1:5198");
  await page.locator(".fg-frame").first().waitFor();
  await page.evaluate(() => window.filmstrip.pause());
  await page.screenshot({ path: `previews/${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
