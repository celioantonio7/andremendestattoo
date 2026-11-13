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
    await page.waitForTimeout(1600);
    const front = page.locator(".style-front").first();
    await front.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await front.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/tmp/andre-check/style-popout-${width}.png` });
    await front.click();
    await page.waitForTimeout(800);
    assert.equal(
      await page.locator(".style-flip-card").first().getAttribute("data-flipped"),
      "true",
    );
    await page.screenshot({ path: `/tmp/andre-check/style-reverse-${width}.png` });
    await page.getByRole("button", { name: "Mostrar arte de Realismo", exact: true }).click();
    await page.waitForTimeout(800);
    await front.click();
    await page.waitForTimeout(750);
    await page.evaluate(() => scrollBy(0, 30));
    await page.waitForTimeout(750);
    assert.equal(
      await page.locator(".style-flip-card").first().getAttribute("data-flipped"),
      "false",
      "Scrolling returns cards to the front",
    );
    const range = await page.locator(".detail-mosaic").evaluate((e) => ({
      top: e.getBoundingClientRect().top + scrollY,
      range: e.offsetHeight - innerHeight,
    }));
    await page.evaluate(({ top, range }) => scrollTo(0, top + range * 0.22), range);
    await page.waitForTimeout(1500);
    assert.notEqual(await page.locator(".serpentine-ribbon").getAttribute("data-active"), "true");
    await page.evaluate(({ top, range }) => scrollTo(0, top + range * 0.58), range);
    await page.waitForTimeout(1800);
    const stage = await page.locator(".mosaic-stage").boundingBox();
    const photo = await page.locator(".mosaic-focus").boundingBox();
    assert.ok(
      Math.abs(photo.width - stage.width) < 2 && Math.abs(photo.height - stage.height) < 2,
      "Photo is fully open before the text enters",
    );
    assert.equal(await page.locator(".serpentine-ribbon").getAttribute("data-active"), "true");
    const phase = await page.locator(".serpentine-ribbon").getAttribute("data-phase");
    const position = await page.evaluate(() => scrollY);
    await page.waitForTimeout(600);
    assert.notEqual(
      await page.locator(".serpentine-ribbon").getAttribute("data-phase"),
      phase,
      "Text continues while scroll is stopped",
    );
    assert.equal(await page.evaluate(() => scrollY), position);
    await page.screenshot({ path: `/tmp/andre-check/serpentine-${width}.png` });
    const reels = await page
      .locator(".wobble-reels")
      .evaluate((e) => e.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y + 100), reels);
    await page.waitForTimeout(900);
    assert.ok(Math.abs((await page.locator(".wobble-stage").boundingBox()).y) < 3);
    await page.evaluate((y) => scrollTo(0, y + 900), reels);
    await page.waitForTimeout(900);
    assert.ok(
      Math.abs((await page.locator(".wobble-stage").boundingBox()).y) < 3,
      "Video stage stays pinned throughout the scroll runway",
    );
    await page.locator(".footer-invitation").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const ribbon = page.locator(".cinematic-footer > .crossed-ribbons .ribbon-track").first();
    const transform = await ribbon.evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(500);
    assert.notEqual(await ribbon.evaluate((e) => getComputedStyle(e).transform), transform);
    assert.equal(await page.locator(".footer-red-word").count(), 2);
    await page.getByRole("button", { name: "Expandir rodapé" }).click();
    await page.waitForTimeout(900);
    const name = page.locator(".footer-panel-name");
    await name.hover();
    await page.waitForTimeout(800);
    assert.equal(
      parseFloat(await name.evaluate((e) => getComputedStyle(e).backgroundPositionX)),
      0,
    );
    await page.screenshot({ path: `/tmp/andre-check/footer-fill-${width}.png` });
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${width}: flip cards, full-zoom text gate, continuous serpentine, video pin, automatic ribbons, red footer words and name fill.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
