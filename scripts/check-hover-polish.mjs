import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
  await page.waitForTimeout(1500);
  const hero = page.locator(".hero-carousel");
  const photo = hero.locator(".hero-artwork").nth(2);
  await photo.hover({ force: true });
  await page.waitForTimeout(500);
  assert.equal(await hero.getAttribute("data-autoplay"), "true");
  const front = page.locator(".style-front").first();
  await front.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const box = await front.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
  await page.waitForTimeout(450);
  const image = front.locator(".style-front-art img");
  assert.notEqual(await image.evaluate((e) => getComputedStyle(e).translate), "none");
  await page.screenshot({ path: "/tmp/andre-check/hover-style-new-fonts.png" });
  await front.click();
  await page.waitForTimeout(750);
  const button = page.locator(".style-back a.cta").first();
  await button.hover();
  await page.waitForTimeout(400);
  assert.equal(await button.evaluate((e) => getComputedStyle(e).overflow), "hidden");
  assert.equal(
    await button.evaluate((e) => getComputedStyle(e, "::before").borderRadius),
    await button.evaluate((e) => getComputedStyle(e).borderRadius),
  );
  await page.screenshot({ path: "/tmp/andre-check/glass-shadow-style-back.png" });
  await page.locator(".style-return-surface").first().click();
  await page.waitForTimeout(750);
  assert.match(
    await page.locator(".about-heading h2").evaluate((e) => getComputedStyle(e).fontFamily),
    /Flamenco/,
  );
  assert.match(
    await page
      .locator(".gallery-section .editorial-heading h2")
      .evaluate((e) => getComputedStyle(e).fontFamily),
    /Clash Display/,
  );
  assert.match(
    await page
      .locator(".story-number")
      .first()
      .evaluate((e) => getComputedStyle(e).fontFamily),
    /Teko/,
  );
  assert.equal(await page.locator(".wobble-caption").count(), 0);
  await page
    .locator(".wobble-reels")
    .evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY + 100));
  await page.locator('.wobble-canvas[data-ready="true"]').waitFor({ timeout: 15000 });
  await page
    .locator(".wobble-canvas")
    .evaluate((e) => e.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".wobble-fallback").count(), 1);
  assert.equal(
    await page.locator(".wobble-reels > .pin-spacer").count(),
    0,
    "GPU fallback removes the pin spacer",
  );
  assert.equal(await page.locator(".wobble-reels").getAttribute("data-active"), "false");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: hero keeps moving on hover, inner-photo parallax, rounded button gloss/shadow, local typography, removed reel captions.",
  );
} finally {
  await browser.close();
}
