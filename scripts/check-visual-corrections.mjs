import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
    await page.waitForTimeout(1200);
    const backgrounds = await page
      .locator(".story-art")
      .evaluateAll((es) => es.map((e) => getComputedStyle(e).backgroundImage));
    assert.equal(new Set(backgrounds).size, 5, "Every story has different artwork");
    assert.equal(await page.locator(".ink-seam").count(), 0, "Dark transition divider removed");
    for (const selector of [".about-heading h2", ".process-section .editorial-heading h2"])
      assert.match(
        await page.locator(selector).evaluate((e) => getComputedStyle(e).fontFamily),
        /Flamenco/,
      );
    const boundary = await page
      .locator("#portfolio")
      .evaluate((e) => e.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y - 400), boundary);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/tmp/andre-check/seam-removed-${width}.png` });
    const process = await page
      .locator("#processo")
      .evaluate((e) =>
        e.parentElement.classList.contains("pin-spacer")
          ? e.parentElement.getBoundingClientRect().top + scrollY
          : e.getBoundingClientRect().top + scrollY,
      );
    await page.evaluate((y) => scrollTo(0, y + 2700), process);
    await page.waitForTimeout(1300);
    const numbers = await page.locator(".step-top > span:not(.step-icon-frame)").evaluateAll((es) =>
      es.map((e) => {
        const s = getComputedStyle(e);
        return {
          background: s.backgroundImage,
          fill: s.webkitTextFillColor,
          color: s.color,
          fontStyle: s.fontStyle,
          height: e.getBoundingClientRect().height,
        };
      }),
    );
    assert.equal(numbers.length, 4);
    for (const number of numbers) {
      assert.equal(number.background, "none");
      assert.equal(number.fill, number.color);
      assert.equal(number.fontStyle, "normal");
      assert.ok(number.height > 70);
    }
    await page.screenshot({ path: `/tmp/andre-check/process-readable-${width}.png` });
    const range = await page.locator(".detail-mosaic").evaluate((e) => ({
      top: e.getBoundingClientRect().top + scrollY,
      height: e.offsetHeight - innerHeight,
    }));
    await page.evaluate(({ top, height }) => scrollTo(0, top + height * 0.58), range);
    await page.waitForTimeout(1600);
    assert.equal(await page.locator(".serpentine-ribbon").getAttribute("data-active"), "true");
    const fontSize = await page
      .locator(".serpentine-ribbon text")
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    assert.ok(fontSize <= 44);
    const phase = await page.locator(".serpentine-ribbon").getAttribute("data-phase");
    await page.waitForTimeout(700);
    assert.notEqual(await page.locator(".serpentine-ribbon").getAttribute("data-phase"), phase);
    assert.equal(
      await page.locator(".mosaic-focus img").getAttribute("src"),
      "/works/detail-mask.webp",
    );
    assert.ok(await page.locator(".mosaic-focus img").evaluate((e) => e.naturalWidth >= 1200));
    await page.screenshot({ path: `/tmp/andre-check/serpentine-readable-${width}.png` });
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${width}: readable titles, solid complete numbers, five unique artworks, no dark divider, continuous responsive serpentine and HD mask.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
