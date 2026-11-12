import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
try {
  if (!process.env.MOBILE_ONLY) {
    await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
    await page.waitForTimeout(1800);
    const hero = page.locator(".hero-carousel");
    const track = hero.locator(".embla-track");
    const position = () => track.evaluate((e) => getComputedStyle(e).transform);
    await page.mouse.move(700, 100);
    const a = await position();
    await page.waitForTimeout(600);
    const b = await position();
    await page.waitForTimeout(600);
    const c = await position();
    assert.notEqual(a, b);
    assert.notEqual(b, c);
    // Choose an exposed image at the left side, clear of the portrait.
    const hit = await page.evaluate(() => {
      for (let y = 280; y < 700; y += 20)
        for (let x = 150; x < 400; x += 20) {
          if (document.elementFromPoint(x, y)?.closest(".hero-artwork")) return { x, y };
        }
    });
    assert.ok(hit);
    await page.mouse.move(hit.x, hit.y);
    await page.waitForTimeout(250);
    assert.equal(await hero.getAttribute("data-autoplay"), "false");
    const stopped = await position();
    await page.waitForTimeout(250);
    assert.equal(stopped, await position());
    await page.mouse.move(700, 100);
    await page.waitForTimeout(200);
    assert.equal(await hero.getAttribute("data-autoplay"), "true");
    // Drag and release, then leave the image: autoplay must resume.
    await page.mouse.move(hit.x, hit.y);
    await page.mouse.down();
    await page.mouse.move(hit.x + 120, hit.y + 20, { steps: 8 });
    await page.mouse.up();
    await page.mouse.move(700, 100);
    await page.waitForTimeout(700);
    assert.equal(await hero.getAttribute("data-autoplay"), "true");
    await page.evaluate(() =>
      scrollTo({
        top: document.querySelector("#estilos").getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(700);
    assert.equal(await hero.getAttribute("data-autoplay"), "false");
    const off = await position();
    await page.waitForTimeout(250);
    assert.equal(off, await position());
    const footer = page.locator(".cinematic-footer");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "/tmp/andre-check/footer-lettering.png" });
    const ribbon = page.locator(".ribbon-track").first();
    await page
      .locator(".crossed-ribbons")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY - 100, behavior: "instant" }),
      );
    await page.waitForTimeout(300);
    const r = await ribbon.evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(300);
    assert.notEqual(await ribbon.evaluate((e) => getComputedStyle(e).transform), r);
    await page.locator(".footer-expand").click();
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(500);
    assert.equal(await page.locator(".footer-panel canvas").getAttribute("data-active"), "true");
    assert.equal(
      await page.locator(".cinematic-atmosphere canvas").getAttribute("data-active"),
      "false",
    );
    await page.screenshot({ path: "/tmp/andre-check/footer-open-motion.png" });
    console.log(
      "Continuous movement, image hover, drag, offscreen pause, ribbons and footer shader passed",
    );
  }
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await mobile.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await mobile.waitForTimeout(3000);
  await mobile.screenshot({ path: "/tmp/andre-check/mobile-hero-motion.png" });
  await mobile.locator(".mobile-menu").click();
  await mobile.getByRole("dialog").waitFor();
  await mobile.getByRole("dialog").getByRole("link", { name: "Sobre", exact: true }).click();
  await mobile.waitForTimeout(2000);
  assert.equal(new URL(mobile.url()).hash, "#sobre");
  await mobile
    .locator(".cylinder-section")
    .evaluate((e) =>
      scrollTo({ top: e.getBoundingClientRect().top + scrollY + 300, behavior: "instant" }),
    );
  await mobile.waitForTimeout(2200);
  await mobile.screenshot({ path: "/tmp/andre-check/mobile-cylinder-motion.png" });
  assert.ok((await mobile.locator(".cylinder-work:enabled").count()) > 0);
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  console.log("Mobile animated menu, cylinder and viewport passed");
} finally {
  await browser.close();
}
