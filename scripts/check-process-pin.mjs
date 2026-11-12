import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  for (const [width, height] of [
    [1440, 754],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://localhost:8081/?pin=1", { waitUntil: "networkidle" });
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
    await page.waitForTimeout(2200);
    const bounds = await page.locator("#processo").evaluate((el) => ({
      top: el.parentElement.getBoundingClientRect().top + scrollY,
      distance: el.parentElement.offsetHeight - innerHeight,
      pinned: el.parentElement.className,
    }));
    assert.match(bounds.pinned, /pin-spacer/);
    const scroll = async (progress) => {
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        bounds.top + bounds.distance * progress,
      );
      await page.waitForTimeout(1000);
    };
    await scroll(0.12);
    assert.ok(Math.abs((await page.locator("#processo").boundingBox()).y) < 2, "section pinned");
    const opacity = async (i) =>
      page
        .locator(".process-card")
        .nth(i)
        .evaluate((el) => +getComputedStyle(el).opacity);
    assert.ok((await opacity(0)) > 0.9);
    assert.ok((await opacity(3)) < 0.1);
    await scroll(0.92);
    assert.ok(
      Math.abs((await page.locator("#processo").boundingBox()).y) < 2,
      "still pinned for last card",
    );
    assert.ok((await opacity(3)) > 0.99);
    const card = await page.locator(".process-card").last().boundingBox();
    assert.ok(card.y >= 0 && card.y + card.height <= height, "last card vertically visible");
    if (width < 900)
      assert.ok(
        card.x >= 0 && card.x + card.width <= width,
        "mobile track brings final card into view",
      );
    await page.screenshot({ path: `/tmp/andre-check/process-pin-${width}.png` });
    await scroll(1.1);
    assert.ok((await page.locator("#processo").boundingBox()).y < -20, "released after sequence");
    await scroll(0.12);
    assert.ok((await opacity(3)) < 0.1, "reverses on scroll up");
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto("http://localhost:8081", { waitUntil: "networkidle" });
  await reduced.waitForTimeout(1500);
  assert.equal(
    await reduced.locator(".pin-spacer").count(),
    0,
    "reduced motion retains normal document flow",
  );
  console.log(
    "PASS: desktop/mobile pinned until final card, final card fits, release, reverse, reduced-motion flow.",
  );
} finally {
  await browser.close();
}
