import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import sharp from "sharp";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.route("**/art/andre-cutout.webp*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded" });
  const loader = page.getByRole("status", { name: "Carregando a experiência André Mendes" });
  assert.equal(await loader.isVisible(), true);
  await page.screenshot({ path: "/tmp/andre-check/preloader.png" });
  await loader.waitFor({ state: "detached", timeout: 9000 });
  assert.equal(await page.locator("main").isVisible(), true);
  assert.match(await page.locator('link[rel="icon"]').getAttribute("href"), /favicon-am/);
  assert.equal((await sharp("public/art/am-logo.webp").metadata()).hasAlpha, true);
  const pixel = await sharp("public/art/am-logo.webp").ensureAlpha().extractChannel(3).stats();
  assert.equal(pixel.channels[0].min, 0, "logo background is transparent");
  const failed = await browser.newPage();
  await failed.route("**/art/andre-cutout.webp*", (route) => route.abort());
  await failed.goto("http://localhost:8080", { waitUntil: "domcontentloaded" });
  await failed
    .getByRole("status", { name: "Carregando a experiência André Mendes" })
    .waitFor({ state: "detached", timeout: 9000 });
  assert.equal(await failed.locator("h1").isVisible(), true);
  await failed.close();
  console.log(
    "PASS: visible preloader, completion, failure recovery, AM favicon and transparent logo.",
  );
} finally {
  await browser.close();
}
