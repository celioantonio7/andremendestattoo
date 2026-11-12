import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await page.waitForTimeout(2300);
  await page.mouse.move(10, 90);
  await page.screenshot({ path: "/tmp/andre-check/continuous-hero.png" });
  console.log("hero", await page.locator(".hero-carousel").getAttribute("data-autoplay"));
  assert.equal(await page.locator(".hero-carousel").getAttribute("data-autoplay"), "true");
  const track = page.locator(".hero-carousel .embla-container");
  console.log(
    "tracks",
    await page.locator(".hero-carousel").evaluate((e) => e.innerHTML.slice(0, 300)),
  );
  const section = page.locator(".cylinder-section");
  const dimensions = await section.evaluate((e) => ({
    top: e.getBoundingClientRect().top + scrollY,
    height: e.offsetHeight,
  }));
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), dimensions.top + 200);
  await page.waitForTimeout(2200);
  console.log(
    "cylinder",
    await section.getAttribute("data-settled"),
    await page.locator(".cylinder-work:enabled").count(),
  );
  await page.screenshot({ path: "/tmp/andre-check/cylinder.png" });
  assert.equal(await page.locator(".cylinder-work").count(), 8);
  assert.ok((await page.locator(".cylinder-work:enabled").count()) > 0);
  const button = page.locator(".cylinder-work:enabled").first();
  await button.click();
  await page.getByRole("dialog").waitFor();
  assert.equal(await page.locator("video").count(), 1);
  console.log("modal", await page.locator("html").getAttribute("data-motion-blocked"));
  assert.equal(await page.locator("html").getAttribute("data-motion-blocked"), "true");
  const video = page.locator("video");
  await video.evaluate((e) => e.play());
  await page.waitForTimeout(500);
  assert.ok((await video.evaluate((e) => e.currentTime)) > 0);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.waitForTimeout(700);
  await page.evaluate(
    (top) => scrollTo({ top, behavior: "instant" }),
    dimensions.top + dimensions.height * 0.4,
  );
  await page.waitForTimeout(40);
  assert.equal(await page.locator(".cylinder-work:enabled").count(), 0);
  await page.waitForTimeout(2200);
  assert.ok((await page.locator(".cylinder-work:enabled").count()) > 0);
  await page.screenshot({ path: "/tmp/andre-check/cylinder-rotated.png" });
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: "#sobre" })),
  );
  await page.waitForTimeout(120);
  assert.equal(await page.locator(".menu-curtain").getAttribute("data-active"), "true");
  await page.waitForTimeout(1500);
  assert.equal(new URL(page.url()).hash, "#sobre");
  assert.equal(await page.locator(".menu-curtain").getAttribute("data-active"), "false");
  await page.screenshot({ path: "/tmp/andre-check/about-handoff.png" });
  assert.deepEqual(errors, []);
  console.log("desktop passed");
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await mobile.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await mobile.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await mobile.waitForTimeout(500);
  const c = mobile.locator(".cylinder-section");
  await c.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(500);
  assert.equal(await mobile.locator(".cylinder-work:enabled").count(), 8);
  await mobile.screenshot({ path: "/tmp/andre-check/cylinder-mobile-reduced.png" });
  console.log("reduced mobile passed");
} finally {
  await browser.close();
}
