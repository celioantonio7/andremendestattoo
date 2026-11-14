import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("/tmp/andre-mobile", { recursive: true });
const b = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  for (const width of [320, 390, 768, 1024]) {
    const p = await b.newPage({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    let navs = 0;
    const errors = [],
      requests = [];
    p.on("request", (r) => {
      requests.push(r.url());
    });
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("crash", () => errors.push("Renderer crashed"));
    p.on("framenavigated", (f) => {
      if (f === p.mainFrame()) navs++;
    });
    await p.addInitScript(() => {
      window.__webgl = 0;
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (/webgl/.test(type)) window.__webgl++;
        return get.call(this, type, ...args);
      };
    });
    await p.goto(process.env.CHECK_BASE_URL || "http://localhost:8083/andremendestattoo/");
    await p.locator(".preloader").waitFor({ state: "detached", timeout: 30000 });
    await p.waitForTimeout(1200);
    const navBaseline = navs;
    const metrics = await p.evaluate(() => ({
      contexts: window.__webgl,
      pins: [...document.querySelectorAll(".pin-spacer")],
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    console.log("metrics", width, metrics);
    assert.equal(metrics.contexts, 0);
    assert.equal(metrics.pins.length, 0);
    assert.ok(metrics.width <= width + 1, "No horizontal document overflow");
    assert.ok(
      !requests.some((r) => /three\.module|\/three.js/.test(r)),
      "No Three downloaded on touch",
    );
    await p.screenshot({ path: `/tmp/andre-mobile/hero-${width}.png` });
    for (const id of ["sobre", "estilos", "duvidas", "portfolio", "processo", "contato"]) {
      await p
        .locator("#" + id)
        .evaluate((e) =>
          scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: "instant" }),
        );
      await p.waitForTimeout(250);
      await p.screenshot({ path: `/tmp/andre-mobile/${id}-${width}.png` });
    }
    const story = await p.locator(".story-card").evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, h: r.height };
      }),
    );
    assert.ok(
      story.every((r, i) => r.h > 250 && (!i || r.top >= story[i - 1].bottom)),
      "Story cards are in document flow",
    );
    const steps = await p.locator(".process-card").evaluateAll((es) =>
      es.map((e) => ({
        opacity: getComputedStyle(e).opacity,
        x: e.getBoundingClientRect().left,
      })),
    );
    assert.ok(steps.every((e) => e.opacity === "1" && e.x >= 0));
    const play = p.locator(".wobble-access-list button").first();
    await play.scrollIntoViewIfNeeded();
    await play.tap();
    const video = p.getByRole("dialog").locator("video");
    await video.waitFor();
    await p.waitForTimeout(700);
    assert.ok(await video.evaluate((e) => !e.paused && e.currentTime > 0));
    await p.keyboard.press("Escape");
    for (let i = 0; i < 20; i++) {
      await p.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        i % 2 ? 0 : documentHeight(metrics),
      );
      await p.waitForTimeout(70);
    }
    assert.equal(navs, navBaseline, "No spontaneous page navigation during repeated scrolling");
    assert.deepEqual(errors, []);
    console.log("PASS touch, video, spacing, scroll", width);
    await p.close();
  }
} finally {
  await b.close();
}
function documentHeight(m) {
  return m.height - 844;
}
