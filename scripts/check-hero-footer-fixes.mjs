import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
const ready = async (page) => {
  await page.goto("http://localhost:8081/?interaction=6", { waitUntil: "networkidle" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
  await page.waitForTimeout(2500);
};
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 754 } });
  await ready(page);
  const selected = () => page.locator(".hero-carousel .is-selected").getAttribute("aria-label");
  const initial = await selected();
  const hit = await page.evaluate(() => {
    for (let x = 280; x >= 80; x -= 40)
      for (let y = 260; y < 440; y += 20)
        if (document.elementFromPoint(x, y)?.closest(".hero-carousel .embla-viewport"))
          return { x, y };
    return null;
  });
  assert.ok(hit, "draggable track is reachable");
  await page.mouse.move(hit.x, hit.y);
  await page.mouse.down();
  await page.mouse.move(hit.x - 240, hit.y - 50, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  assert.notEqual(await selected(), initial, "mouse drags hero");
  const matrix = await page
    .locator(".hero-carousel .embla-viewport")
    .evaluate((el) => getComputedStyle(el).transform);
  assert.notEqual(matrix, "none", "track is diagonal");
  const copy = await page.locator(".hero-copy").boundingBox(),
    cta = await page.locator(".hero-bottom .cta").boundingBox(),
    styles = await page.locator(".hero-specialties").boundingBox();
  assert.ok(
    cta.y > copy.y + copy.height + 8 && styles.y > cta.y + cta.height + 8,
    "CTA group has clear sequential gaps",
  );
  await page.screenshot({ path: "/tmp/andre-check/hero-diagonal-1440.png" });
  const dive = await page
    .locator(".dive-sequence")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo({ top: y + 10, behavior: "instant" }), dive);
  await page.waitForTimeout(1000);
  assert.match(
    await page.locator(".dive-layer-2").evaluate((el) => getComputedStyle(el).clipPath),
    /50%/,
    "second image starts hidden",
  );
  assert.equal(
    await page.locator(".dive-layer-1 img").evaluate((el) => getComputedStyle(el).objectFit),
    "contain",
  );
  await page.screenshot({ path: "/tmp/andre-check/dive-first-complete.png" });
  await page.locator(".crossed-ribbons").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const time = () =>
    page
      .locator(".ribbon-track")
      .first()
      .evaluate((el) => el.getAnimations()[0].currentTime);
  const t = await time();
  await page.waitForTimeout(650);
  assert.ok((await time()) > t + 100, "ribbons advance before footer opens");
  await page.locator(".footer-expand").click();
  await page.locator('.footer-panel canvas[data-ready="true"]').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/andre-check/footer-open-shader.png" });
  await page.close();
  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await ready(touch);
  const before = await touch.locator(".hero-carousel .is-selected").getAttribute("aria-label");
  const client = await touch.context().newCDPSession(touch);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 300, y: 390 }],
  });
  for (let i = 1; i <= 12; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 300 - i * 18, y: 390 - i * 3.8 }],
    });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await touch.waitForTimeout(1000);
  assert.notEqual(
    await touch.locator(".hero-carousel .is-selected").getAttribute("aria-label"),
    before,
    "finger swipes hero",
  );
  await touch.screenshot({ path: "/tmp/andre-check/hero-diagonal-390.png" });
  console.log(
    "PASS: mouse drag and finger swipe, diagonal hero, copy/CTA/style spacing, first Dive image unobscured, ribbons autoplay before opening, live footer shader.",
  );
} finally {
  await browser.close();
}
