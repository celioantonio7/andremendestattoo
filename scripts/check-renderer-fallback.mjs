import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.CHECK_BASE_URL || "http://127.0.0.1:8083/andremendestattoo/";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-webgl"] });
try {
  for (const [width, reducedMotion] of [
    [1440, "no-preference"],
    [390, "no-preference"],
    [1440, "reduce"],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: width < 900 ? 844 : 900 },
      hasTouch: width < 900,
      isMobile: width < 900,
      reducedMotion,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.locator(".preloader").waitFor({ state: "detached" });
    await page
      .locator(".wobble-reels")
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY + 100, behavior: "instant" }),
      );
    await page.waitForFunction(
      () => document.querySelector(".wobble-reels")?.getAttribute("data-renderer") === "css-3d",
    );
    await page.waitForTimeout(600);
    assert.ok(
      await page
        .locator(".wobble-access-list")
        .evaluate((e) => getComputedStyle(e).perspective !== "none"),
    );
    assert.ok(
      await page
        .locator(".wobble-access-list button")
        .evaluateAll((es) =>
          es.every(
            (e) =>
              e.style.transform.includes("translate3d") && e.style.transform.includes("rotateY"),
          ),
        ),
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const target = await page.locator(".wobble-access-list button").evaluateAll(
      (es) =>
        es
          .map((e) => ({ e, r: e.getBoundingClientRect() }))
          .filter(
            ({ e, r }) =>
              r.left > 0 &&
              r.right < innerWidth &&
              r.top > 130 &&
              r.bottom < innerHeight &&
              document
                .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
                ?.closest("button") === e,
          )
          .map(({ r }) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 }))[0],
    );
    assert.ok(target, "A front-facing spiral card can be clicked without WebGL");
    if (width < 900) await page.touchscreen.tap(target.x, target.y);
    else await page.mouse.click(target.x, target.y);
    const video = page.getByRole("dialog").locator("video");
    await video.waitFor();
    await page.waitForTimeout(600);
    assert.ok(await video.evaluate((e) => !e.paused && e.currentTime > 0));
    await page.keyboard.press("Escape");
    const atmosphere = page.locator(".cinematic-atmosphere canvas");
    assert.equal(await atmosphere.getAttribute("data-renderer"), "css");
    assert.ok(
      await atmosphere.evaluate((e) =>
        getComputedStyle(e).maskImage.includes("data:image/svg+xml"),
      ),
      "No-WebGL atmosphere retains smoke texture",
    );
    assert.deepEqual(errors, []);
    console.log(
      `PASS without WebGL: ${width}, reduced motion ${reducedMotion}, helix preserved, video plays, textured smoke`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
