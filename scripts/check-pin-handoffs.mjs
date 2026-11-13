import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    let triggerModule;
    const errors = [];
    page.on("request", (request) => {
      if (/gsap_ScrollTrigger\.js\?/.test(request.url())) triggerModule = request.url();
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:8081");
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
    await page.waitForTimeout(2500);
    const pins = await page.evaluate(async (url) => {
      const { ScrollTrigger } = await import(url);
      ScrollTrigger.refresh();
      return ["about-pin", "reels-pin", "process-pin"].map((id) => {
        const pin = ScrollTrigger.getById(id);
        return { id, start: pin.start, end: pin.end };
      });
    }, triggerModule);
    assert.ok(pins[0].end < pins[1].start && pins[1].end < pins[2].start);
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pins[2].start - 500);
    await page.waitForTimeout(1000);
    const approach = await page.locator("#processo").boundingBox();
    assert.ok(
      approach.y > 450 && approach.y < 550,
      "Process cannot pin while the previous scene is still onscreen",
    );
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pins[2].start + 500);
    await page.waitForTimeout(1000);
    assert.ok(Math.abs((await page.locator("#processo").boundingBox()).y) < 3);
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(500);
    await page.evaluate(() =>
      window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: "#processo" })),
    );
    await page.waitForTimeout(1600);
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - pins[2].start) < 130,
      "Menu must return to scene start rather than its translated end",
    );
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      pins[0].start + (pins[0].end - pins[0].start) * 0.8,
    );
    await page.waitForTimeout(1200);
    const transforms = await page
      .locator(".story-card")
      .evaluateAll((cards) => cards.map((card) => getComputedStyle(card).transform));
    assert.ok(
      transforms.some((transform) => {
        const values = transform
          .slice(transform.indexOf("(") + 1, -1)
          .split(",")
          .map(Number);
        return Math.abs(values[1] || 0) > 0.01;
      }),
      "Previous story cards have an irregular rotation",
    );
    assert.equal(await page.locator(".wobble-caption").count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        width,
        pins,
        approachY: approach.y,
        menu: "returns to pin start",
        stack: "irregular",
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
