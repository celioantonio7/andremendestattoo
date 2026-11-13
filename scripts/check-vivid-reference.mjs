import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
    await page.waitForTimeout(2500);
    await page
      .locator(".style-grid")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY - 130, behavior: "instant" }),
      );
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `/tmp/andre-check/vivid-styles-${width}.png` });
    await page.locator("#processo").evaluate((e) =>
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY + innerHeight * 0.6,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(1400);
    assert.equal(await page.locator(".step-icon-frame").count(), 4);
    assert.equal(await page.locator(".process-monogram").count(), 1);
    await page.screenshot({ path: `/tmp/andre-check/vivid-process-${width}.png` });
    const response = await page.goto("http://localhost:8081/pagina-inexistente");
    assert.equal(response.status(), 404);
    await page.locator(".not-found-content").waitFor();
    await page.screenshot({ path: `/tmp/andre-check/vivid-404-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "PASS: vivid styles, process icon frames, AM watermark and working branded 404 on desktop/mobile.",
  );
} finally {
  await browser.close();
}
