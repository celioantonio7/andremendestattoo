import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import sharp from "sharp";
const { data, info } = await sharp("public/art/andre-cutout.webp")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (const [x, y] of [
  [10, 100],
  [1100, 300],
  [1000, 700],
  [30, 700],
])
  assert.equal(data[(y * info.width + x) * 4 + 3], 0, "background alpha is transparent");
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
const errors = [];
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [width, height] of [
    [1440, 754],
    [1280, 720],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://localhost:8081/?scenery=3", { waitUntil: "networkidle" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
    await page.waitForTimeout(2600);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    assert.equal(await page.locator("main section > .section-backdrop").count(), 6);
    assert.equal(
      await page
        .locator(".hero-section .section-backdrop img")
        .evaluateAll((els) => els.filter((el) => el.complete && el.naturalWidth > 0).length),
      2,
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const hero = await page.locator("#inicio").boundingBox();
    assert.ok(hero.height <= height + 1, "hero fits visible height");
    const cta = await page.locator(".hero-bottom .cta").boundingBox();
    assert.ok(cta.y + cta.height <= height, "CTA visible");
    if (width >= 900) {
      const portrait = await page.locator(".hero-portrait img").boundingBox();
      const header = await page.locator(".main-nav").boundingBox();
      assert.ok(
        portrait.y >= header.y + header.height - 3,
        `hair clear at ${width}: portrait ${portrait.y}, header ${header.y + header.height}`,
      );
      const name = await page.locator(".hero-name").boundingBox();
      assert.ok(name.y > portrait.y + portrait.height * 0.55, "name below face");
    }
    await page.screenshot({ path: `/tmp/andre-check/scenery-hero-${width}.png` });
    if (width === 1440)
      for (const id of ["sobre", "estilos", "portfolio", "processo", "contato"]) {
        await page
          .locator(`#${id}`)
          .evaluate((el) =>
            scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }),
          );
        await page.waitForTimeout(1300);
        await page.screenshot({ path: `/tmp/andre-check/scenery-${id}.png` });
      }
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 8081 scenery in all six sections, transparent portrait edges, hero/CTA fit, face and hair clear, desktop and mobile.",
  );
} finally {
  await browser.close();
}
