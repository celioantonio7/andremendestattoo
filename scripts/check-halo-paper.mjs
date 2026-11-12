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
    await page.waitForTimeout(3000);
    assert.equal(await page.locator(".halo-orbit").count(), 2);
    await page.mouse.move(width * 0.8, 180);
    await page.waitForTimeout(1000);
    const center = await page.locator(".hero-halo").evaluate((e) => {
      const r = e.getBoundingClientRect();
      return r.x + r.width / 2;
    });
    assert.ok(Math.abs(center - width / 2) < 2);
    await page.screenshot({ path: `/tmp/andre-check/halo-paper-${width}.png` });
    await page
      .locator(".style-grid")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY - 150, behavior: "instant" }),
      );
    await page.waitForTimeout(1200);
    assert.equal(
      await page
        .locator(".halo-orbit")
        .first()
        .evaluate((e) => getComputedStyle(e).animationPlayState),
      "paused",
    );
    if (width === 1440) {
      await page.locator(".style-card").first().hover();
      await page.waitForTimeout(450);
      assert.ok(
        Number(
          await page
            .locator(".style-card .paper-lens")
            .first()
            .evaluate((e) => getComputedStyle(e).opacity),
        ) > 0.9,
      );
    }
    const seam = page.locator(".ink-seam");
    await seam.evaluate((e) =>
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY - innerHeight * 0.7,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(900);
    await page.screenshot({ path: `/tmp/andre-check/paper-seam-${width}.png` });
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "PASS: centered animated halo, pointer depth, offscreen pause, card lens hover and scroll seam on desktop/mobile.",
  );
} finally {
  await browser.close();
}
