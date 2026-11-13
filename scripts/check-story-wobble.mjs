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
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
    await page.waitForTimeout(2500);
    const start = await page
      .locator("#sobre")
      .evaluate((e) => e.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), start + 100);
    await page.waitForTimeout(1600);
    const initial = await page.locator(".sculpture-art").boundingBox();
    const section = await page.locator("#sobre").boundingBox();
    assert.ok(Math.abs(section.y) < 5);
    await page.screenshot({ path: `/tmp/andre-check/story-pin-start-${width}.png` });
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      start + (width === 1440 ? 900 : 844) * 2.1,
    );
    await page.waitForTimeout(1800);
    const later = await page.locator(".sculpture-art").boundingBox();
    assert.ok(Math.abs(initial.y - later.y) < 3);
    assert.ok(Math.abs((await page.locator("#sobre").boundingBox()).y) < 5);
    const visible = await page
      .locator(".story-card")
      .evaluateAll(
        (es) =>
          es.filter(
            (e) =>
              getComputedStyle(e).visibility === "visible" &&
              Number(getComputedStyle(e).opacity) > 0.95,
          ).length,
      );
    assert.ok(visible >= 2, "Previous cards remain in the stack");
    const positions = await page
      .locator(".story-card")
      .evaluateAll((es) =>
        es
          .filter(
            (e) =>
              getComputedStyle(e).visibility === "visible" &&
              Number(getComputedStyle(e).opacity) > 0.95,
          )
          .map((e) => e.getBoundingClientRect().top),
      );
    assert.ok(
      new Set(positions.map((top) => Math.round(top))).size > 1,
      "Previous cards remain at different heights in the irregular stack",
    );
    await page.screenshot({ path: `/tmp/andre-check/story-pin-later-${width}.png` });
    await page
      .locator(".wobble-reels")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY + 100, behavior: "instant" }),
      );
    await page.waitForTimeout(2400);
    assert.equal(await page.locator(".wobble-canvas").getAttribute("data-ready"), "true");
    assert.equal(await page.locator(".wobble-reels").getAttribute("data-active"), "true");
    assert.ok((await page.locator(".wobble-play-badge:not([hidden])").count()) > 0);
    assert.equal(await page.locator(".gallery-carousel .video-play-glass").count(), 8);
    await page.screenshot({ path: `/tmp/andre-check/wobble-reels-${width}.png` });
    const c = page.locator(".wobble-canvas");
    await c.focus();
    await c.press("ArrowRight");
    await page.waitForTimeout(1800);
    await c.press("Enter");
    await page.getByRole("dialog").waitFor();
    const video = page.getByRole("dialog").locator("video");
    await video.evaluate((v) => v.play());
    await page.waitForTimeout(500);
    assert.ok((await video.evaluate((v) => v.currentTime)) > 0);
    await page.keyboard.press("Escape");
    await page
      .locator(".detail-mosaic")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: "instant" }),
      );
    await page.waitForTimeout(700);
    assert.equal(await page.locator(".wobble-reels").getAttribute("data-active"), "false");
    assert.ok((await page.locator('.detail-mosaic img[src*="detail-"]').count()) >= 3);
    assert.equal(
      await page.locator(".mosaic-focus img").getAttribute("src"),
      "/works/detail-mask.webp",
    );
    assert.equal(await page.locator('.detail-mosaic img[src="/works/work-3.webp"]').count(), 0);
    const glass = await page
      .locator(".gallery-carousel .video-play-glass")
      .first()
      .evaluate((e) => getComputedStyle(e).backdropFilter);
    assert.match(glass, /blur/);
    if (width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(1000);
      await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
      await page.waitForTimeout(700);
      assert.deepEqual(await page.locator(".cyber-label").allTextContents(), [
        "Início",
        "Sobre",
        "Estilos",
        "Portfólio",
        "Processo",
        "Contato",
      ]);
      await page.screenshot({ path: "/tmp/andre-check/cyber-menu-mobile.png" });
      await page.getByRole("link", { name: "Sobre", exact: true }).hover();
      assert.equal(await page.locator(".cyber-label").nth(1).textContent(), "Sobre");
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
      await page.waitForTimeout(700);
      assert.equal(await page.locator(".cyber-label").first().textContent(), "Início");
      await page.keyboard.press("Escape");
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await reduced.goto("http://localhost:8081");
  await reduced.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await reduced.waitForTimeout(800);
  assert.ok(
    await reduced.locator(".wobble-reels").evaluate((e) => e.classList.contains("wobble-fallback")),
  );
  assert.equal(await reduced.locator(".wobble-access-list button").count(), 8);
  console.log(
    "PASS: full About pin, fixed sculpture, opaque stacked stories and glass play indicators, 3D spiral, keyboard video playback, offscreen pause, oriental mask zoom, one-shot mobile scramble and reduced-motion fallback.",
  );
} finally {
  await browser.close();
}
