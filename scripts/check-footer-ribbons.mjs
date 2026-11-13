import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:8081");
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
    const enter = () =>
      page
        .locator(".cinematic-footer")
        .evaluate((el) =>
          scrollTo({ top: el.getBoundingClientRect().top + scrollY - 450, behavior: "instant" }),
        );
    const times = (selector) =>
      page
        .locator(`${selector} .ribbon-track`)
        .evaluateAll((tracks) =>
          tracks.map((track) => Number(track.getAnimations()[0]?.currentTime) || 0),
        );
    await enter();
    await page.waitForTimeout(200);
    const first = await times(".cinematic-footer");
    await page.waitForTimeout(700);
    const second = await times(".cinematic-footer");
    second.forEach((time, i) =>
      assert.ok(time > first[i] + 400, "Both ribbons move while scrolling is stopped"),
    );
    const geometry = await page.locator(".cinematic-footer .ribbon").evaluateAll((rows) =>
      rows.map((row) => ({
        viewport: row.clientWidth,
        track: row.firstElementChild.scrollWidth,
        group: row.firstElementChild.firstElementChild.offsetWidth,
      })),
    );
    geometry.forEach((row) =>
      assert.ok(row.track - row.group >= row.viewport, "No empty area at the end of a loop"),
    );
    const offsets = () =>
      page
        .locator(".cinematic-footer .ribbon-track")
        .evaluateAll((tracks) =>
          tracks.map((track) => new DOMMatrix(getComputedStyle(track).transform).m41),
        );
    const beforeResize = await offsets();
    await page.locator(".cinematic-footer .ribbon-track > span").evaluateAll((groups) =>
      groups.forEach((group) => {
        group.style.letterSpacing = ".3em";
      }),
    );
    await page.waitForTimeout(180);
    const afterResize = await offsets();
    afterResize.forEach((offset, i) =>
      assert.ok(
        Math.abs(offset - beforeResize[i]) < 40,
        "Font metric changes retain each track's visible position",
      ),
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(200);
    const paused = await times(".cinematic-footer");
    await page.waitForTimeout(400);
    const still = await times(".cinematic-footer");
    still.forEach((time, i) =>
      assert.ok(Math.abs(time - paused[i]) < 40, "Offscreen tracks pause without resetting"),
    );
    await enter();
    await page.waitForTimeout(300);
    const resumed = await times(".cinematic-footer");
    resumed.forEach((time, i) =>
      assert.ok(time >= paused[i], "Entering resumes the previous phase"),
    );
    await page.locator(".footer-expand").click();
    await page.waitForTimeout(400);
    const panel1 = await times(".footer-panel");
    await page.waitForTimeout(700);
    const panel2 = await times(".footer-panel");
    panel2.forEach((time, i) =>
      assert.ok(time > panel1[i] + 400, "Open footer ribbons keep moving"),
    );
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        width,
        geometry,
        idle: "both moving",
        reentry: "phase preserved",
        panel: "both moving",
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
