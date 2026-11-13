import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env["CHECK_BASE_URL"] || "http://localhost:8083/andremendestattoo/";
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    const errors = [],
      missing = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (
        response.status() >= 400 &&
        response.url().startsWith(base) &&
        response.request().resourceType() !== "document"
      )
        missing.push(response.url());
    });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
    await page.waitForTimeout(1600);
    assert.equal(await page.locator(".hero-carousel").getAttribute("data-autoplay"), "true");
    assert.equal(
      await page.locator("link[rel=canonical]").getAttribute("href"),
      "https://celioantonio7.github.io/andremendestattoo/",
    );
    assert.equal(await page.locator(".gallery-carousel").count(), 0);
    assert.equal(await page.locator(".portfolio-faq-item").count(), 5);
    const canvas = page.locator(".wobble-canvas");
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    await canvas.focus();
    await canvas.press("ArrowRight");
    await page.waitForFunction(
      () => document.querySelector(".wobble-reels")?.getAttribute("data-settled") === "true",
    );
    await canvas.press("Enter");
    const video = page.getByRole("dialog").locator("video");
    await video.waitFor();
    await page.waitForTimeout(900);
    assert.ok(
      await video.evaluate((element) => !element.paused && element.currentTime > 0),
      "A user action starts video playback",
    );
    await page.keyboard.press("Escape");
    const missingResponse = await page.goto(new URL("pagina-inexistente", base).href);
    await page.waitForTimeout(800);
    assert.equal(missingResponse.status(), 404);
    assert.equal(await page.locator(".not-found-page").count(), 1);
    assert.equal(
      await page.locator('meta[name="robots"]').getAttribute("content"),
      "noindex, follow",
    );
    assert.equal(
      await page.getByRole("link", { name: "Voltar ao início" }).getAttribute("href"),
      "/andremendestattoo/",
    );
    assert.ok(
      await page
        .locator(".not-found-content h1 img")
        .evaluate((element) => element.naturalWidth > 0),
    );
    await page.screenshot({ path: `/tmp/andre-check/pages-404-${width}.png` });
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    console.log(
      `PASS ${width}: Pages project path, hydration, automatic video playback, canonical, custom HTTP404, no missing assets or JavaScript errors.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
