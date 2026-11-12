import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import sharp from "sharp";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator(".preloader-photo").count(), 6);
  await page.waitForFunction(
    () => Number(getComputedStyle(document.querySelector(".preloader-final-logo")).opacity) > 0.95,
    { timeout: 6500 },
  );
  await page.screenshot({ path: "/tmp/andre-check/preloader-final-mark.png" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 9000 });
  await page.waitForTimeout(2300);
  const alpha = await sharp("public/favicon-am.png").ensureAlpha().extractChannel(3).stats();
  assert.equal(alpha.channels[0].min, 0, "favicon is transparent");
  assert.ok(
    Number(
      await page.locator(".cinematic-atmosphere").evaluate((el) => getComputedStyle(el).zIndex),
    ) < Number(await page.locator("main").evaluate((el) => getComputedStyle(el).zIndex)),
    "atmosphere stays under content",
  );
  await page.screenshot({ path: "/tmp/andre-check/real-hero.png" });
  const selected = () => page.locator(".hero-carousel .is-selected").getAttribute("aria-label");
  const initial = await selected();
  await page.mouse.move(700, 100);
  await page.waitForTimeout(1450);
  assert.notEqual(await selected(), initial, "faster autoplay advances in 1.2 seconds");
  for (let i = 0; i < 2; i++) {
    const button = page.locator(".reel-card").nth(i);
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const video = page.getByRole("dialog").locator("video");
    await video.waitFor();
    await page.waitForFunction(
      () => {
        const v = document.querySelector("video");
        return v && v.readyState >= 2 && v.duration > 30;
      },
      { timeout: 12000 },
    );
    await video.evaluate(async (v) => {
      v.muted = true;
      await v.play();
    });
    await page.waitForTimeout(600);
    assert.ok((await video.evaluate((v) => v.currentTime)) > 0.1, "local reel plays");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    assert.ok(await button.evaluate((el) => el === document.activeElement), "reel restores focus");
  }
  const dive = page.locator(".dive-sequence");
  const bounds = await dive.evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    height: el.offsetHeight,
  }));
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), bounds.top);
  await page.waitForTimeout(900);
  const before = await page
    .locator(".dive-layer-2")
    .evaluate((el) => getComputedStyle(el).clipPath);
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.top + (bounds.height - 960) * 0.9,
  );
  await page.waitForTimeout(1500);
  const after = await page.locator(".dive-layer-2").evaluate((el) => getComputedStyle(el).clipPath);
  assert.notEqual(after, before, "Dive-in mask follows scroll");
  assert.ok(
    Number(await page.locator(".dive-copy").evaluate((el) => getComputedStyle(el).opacity)) > 0.9,
  );
  await page.screenshot({ path: "/tmp/andre-check/dive-final.png" });
  await page.locator(".cinematic-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: "/tmp/andre-check/cinematic-footer.png" });
  await page.getByRole("button", { name: "Expandir rodapé" }).click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(350);
  assert.equal(
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Instagram", exact: true })
      .getAttribute("href"),
    "https://www.instagram.com/andremndes/",
  );
  const panel = await page.getByRole("dialog").boundingBox();
  assert.ok(
    panel.x >= -1 && panel.y >= -1 && panel.width >= 1400,
    "expanded footer fills viewport",
  );
  await page.screenshot({ path: "/tmp/andre-check/footer-panel.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Expandir rodapé" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Início", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.waitForTimeout(1400);
  assert.ok(
    (await page.evaluate(() => scrollY)) < 100,
    "footer navigation reaches the chosen section instead of returning focus to footer",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#portfolio").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "mobile gallery does not overflow",
  );
  await page.locator(".cinematic-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Expandir rodapé" }).click();
  await page.waitForTimeout(250);
  assert.equal(
    await page.getByRole("dialog").getByRole("link", { name: "WhatsApp", exact: true }).isVisible(),
    true,
  );
  await page.screenshot({ path: "/tmp/andre-check/mobile-footer-panel.png" });
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(300);
  assert.ok(
    (await dive.evaluate((el) => el.offsetHeight)) < 1000,
    "reduced motion removes long sticky sequence",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: photo preloader and final logo; transparent favicon; background depth; faster carousel; two actual reels play with focus restoration; Dive-in masks; animated footer and accessible fullscreen panel; mobile and reduced motion.",
  );
} finally {
  await browser.close();
}
