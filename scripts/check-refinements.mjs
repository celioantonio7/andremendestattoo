import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import sharp from "sharp";
const face = { left: 420, top: 450, width: 250, height: 280 };
const originalFace = await sharp("public/andremendes.png")
  .extract(face)
  .removeAlpha()
  .raw()
  .toBuffer();
const restoredFace = await sharp("public/art/andre-cutout.webp")
  .extract({ ...face, top: face.top - 216 })
  .removeAlpha()
  .raw()
  .toBuffer();
assert.equal(
  Buffer.compare(originalFace, restoredFace),
  0,
  "facial RGB is the original photograph",
);
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
  await page.waitForTimeout(2600);
  assert.equal(await page.locator(".story-card").count(), 5);
  assert.equal(await page.locator(".hero-carousel .artwork-button:not(:disabled)").count(), 0);
  const portrait = await page.locator(".hero-portrait").boundingBox();
  const lettering = await page.locator(".hero-name").boundingBox();
  assert.ok(lettering.y > portrait.y + portrait.height * 0.55, "lettering remains below the face");
  assert.equal(
    await page.locator(".floating-whatsapp").evaluate((el) => getComputedStyle(el).color),
    "rgb(37, 211, 102)",
  );
  await page.mouse.move(700, 100);
  const selected = () => page.locator(".hero-carousel .is-selected").getAttribute("aria-label");
  const initial = await selected();
  await page.waitForTimeout(1450);
  assert.notEqual(await selected(), initial, "hero advances every 1.2 seconds");
  const viewport = await page.locator(".hero-carousel .embla-viewport").boundingBox();
  await page.mouse.move(viewport.x + viewport.width * 0.1, viewport.y + viewport.height * 0.5);
  await page.waitForTimeout(100);
  const hovered = await selected();
  await page.waitForTimeout(1450);
  assert.equal(await selected(), hovered, "hover pauses decorative work wall");
  await page.mouse.move(700, 100);
  await page.screenshot({ path: "/tmp/andre-check/refined-hero.png" });
  await page.locator("#sobre").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/andre-check/refined-about.png" });
  const process = await page
    .locator(".process-grid")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo({ top: y - innerHeight, behavior: "instant" }), process);
  await page.waitForTimeout(1200);
  const hidden = await page
    .locator(".process-card")
    .first()
    .evaluate((el) => +getComputedStyle(el).opacity);
  await page.evaluate(
    (y) => scrollTo({ top: y - innerHeight * 0.35, behavior: "instant" }),
    process,
  );
  await page.waitForTimeout(1300);
  const shown = await page
    .locator(".process-card")
    .first()
    .evaluate((el) => +getComputedStyle(el).opacity);
  assert.ok(shown > hidden, `process reveals ${hidden}->${shown}`);
  await page.evaluate((y) => scrollTo({ top: y - innerHeight, behavior: "instant" }), process);
  await page.waitForTimeout(1300);
  assert.ok(
    (await page
      .locator(".process-card")
      .first()
      .evaluate((el) => +getComputedStyle(el).opacity)) < shown,
  );
  const footerY = await page
    .locator(".cinematic-footer")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo({ top: y - 300, behavior: "instant" }), footerY);
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollBy({ top: 180, behavior: "instant" }));
  await page.waitForTimeout(100);
  assert.ok(
    (await page
      .locator(".ribbon-track")
      .first()
      .evaluate((el) => el.getAnimations()[0].playbackRate)) > 1,
    "ribbons accelerate while scrolling down",
  );
  await page.locator(".footer-expand").scrollIntoViewIfNeeded();
  await page.locator(".footer-expand").click();
  await page.screenshot({ path: "/tmp/andre-check/refined-footer.png" });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [390, 667],
    [768, 700],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    const size = await page
      .locator(".footer-panel")
      .evaluate((el) => ({ height: el.clientHeight, scroll: el.scrollHeight }));
    assert.ok(
      size.scroll <= size.height + 1,
      `footer fits ${width}x${height}: ${JSON.stringify(size)}`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: decorative hero, intact portrait layering, five story cards, green WhatsApp, reversible process, footer fits four sizes.",
  );
} finally {
  await browser.close();
}
