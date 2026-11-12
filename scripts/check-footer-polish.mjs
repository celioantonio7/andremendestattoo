import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
    await page.waitForTimeout(2500);
    assert.equal(await page.locator(".rose-detail").count(), 0);
    assert.ok(
      await page
        .locator(".main-nav")
        .evaluate((e) => getComputedStyle(e).backdropFilter.includes("22px")),
    );
    await page.locator(".cinematic-footer").evaluate((e) =>
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY - innerHeight + 100,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(400);
    const ribbon = page.locator(".cinematic-footer .ribbon-track").first();
    const a = await ribbon.evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(500);
    assert.notEqual(a, await ribbon.evaluate((e) => getComputedStyle(e).transform));
    await page.locator(".footer-expand").click();
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(1200);
    const panel = page.locator(".footer-panel");
    const fit = await panel.evaluate((e) => ({
      scroll: e.scrollHeight,
      client: e.clientHeight,
      bottom: e.querySelector(".footer-panel-name").getBoundingClientRect().bottom,
    }));
    console.log(width, height, fit);
    assert.ok(fit.scroll <= fit.client + 1);
    assert.ok(fit.bottom <= height);
    const track = panel.locator(".ribbon-track").first();
    const start = await track.evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(500);
    assert.notEqual(start, await track.evaluate((e) => getComputedStyle(e).transform));
    await page.screenshot({ path: `/tmp/andre-check/footer-fixed-${width}-${height}.png` });
    await page.keyboard.press("Escape");
    await page.close();
  }
  console.log(
    "PASS: footer fits all viewports; both closed/open ribbons move; glass menu; no detached rose.",
  );
} finally {
  await browser.close();
}
