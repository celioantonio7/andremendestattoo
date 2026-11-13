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
    assert.equal(await page.locator(".cylinder-section").count(), 0);
    assert.equal(await page.locator(".video-mosaic .mosaic-card").count(), 8);
    const videos = page.locator(".video-mosaic");
    const pos = await videos.evaluate((e) => ({
      top: e.getBoundingClientRect().top + scrollY,
      height: e.offsetHeight,
    }));
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), pos.top);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `/tmp/andre-check/video-mosaic-${width}.png` });
    assert.ok((await videos.locator("button:enabled").count()) > 0);
    await videos.locator(".mosaic-focus").click();
    const video = page.getByRole("dialog").locator("video");
    await video.evaluate((e) => e.play());
    await page.waitForTimeout(500);
    assert.ok((await video.evaluate((e) => e.currentTime)) > 0);
    await page.keyboard.press("Escape");
    await page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      pos.top + (pos.height - (width === 1440 ? 900 : 844)) * 0.7,
    );
    await page.waitForTimeout(50);
    assert.equal(await videos.locator("button:enabled").count(), 0);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `/tmp/andre-check/video-mosaic-expanded-${width}.png` });
    const photos = page.locator(".detail-mosaic");
    const photoPos = await photos.evaluate((e) => ({
      top: e.getBoundingClientRect().top + scrollY,
      height: e.offsetHeight,
    }));
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), photoPos.top);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `/tmp/andre-check/detail-mosaic-${width}.png` });
    assert.ok((await photos.locator('img[src*="detail-"]').count()) >= 3);
    await page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      photoPos.top + (photoPos.height - (width === 1440 ? 900 : 844)) * 0.96,
    );
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `/tmp/andre-check/detail-mosaic-expanded-${width}.png` });
    assert.deepEqual(errors, []);
    await page.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await reduced.goto("http://localhost:8081");
  await reduced.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await reduced.locator(".video-mosaic").scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(400);
  assert.equal(await reduced.locator(".video-mosaic button:enabled").count(), 8);
  console.log(
    "PASS: two expanding mosaics, eight playable real videos, scroll click gate, three new photos, mobile and reduced motion, no browser errors.",
  );
} finally {
  await browser.close();
}
