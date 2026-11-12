import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [],
    missing = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().startsWith("http://localhost:8083"))
      missing.push(response.url());
  });
  await page.goto("http://localhost:8083/andremendestattoo/", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await page.waitForTimeout(3000);
  assert.equal(await page.locator(".hero-carousel").getAttribute("data-autoplay"), "true");
  assert.ok(await page.locator(".hero-section>.smoke-surface").getAttribute("data-ready"));
  assert.equal(
    await page.locator("link[rel=canonical]").getAttribute("href"),
    "https://demo.example/andremendestattoo/",
  );
  assert.equal(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
    "https://demo.example/andremendestattoo/og-cover.jpg",
  );
  await page
    .locator(".cylinder-section")
    .evaluate((e) =>
      scrollTo({ top: e.getBoundingClientRect().top + scrollY + 200, behavior: "instant" }),
    );
  await page.waitForTimeout(2200);
  await page.locator(".cylinder-work:enabled").first().click();
  const video = page.getByRole("dialog").locator("video");
  await video.evaluate((e) => e.play());
  await page.waitForTimeout(600);
  assert.ok((await video.evaluate((e) => e.currentTime)) > 0);
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await page.waitForTimeout(600);
  await page.locator(".footer-expand").click();
  await page.getByRole("dialog").waitFor();
  assert.equal(await page.locator(".footer-panel-name").textContent(), "ANDRÉ MENDES");
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  console.log(
    "PASS: GitHub Pages subpath, hydration, hero loop, surface shaders, real video playback, expanded footer, canonical and social image; no missing local assets or JS errors.",
  );
} finally {
  await browser.close();
}
