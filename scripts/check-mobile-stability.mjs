import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("/tmp/andre-mobile", { recursive: true });
const b = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [844, 390],
  ]) {
    const p = await b.newPage({
      viewport: { width, height },
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
    await p.evaluate(() => scrollTo(0, 0));
    const bounds = await p.evaluate(() => {
      const about = document.querySelector("#sobre").getBoundingClientRect();
      const stack = document.querySelector(".story-stack").getBoundingClientRect();
      const styles = document.querySelector("#estilos").getBoundingClientRect();
      const process = document.querySelector("#processo").getBoundingClientRect();
      const grid = document.querySelector(".process-grid").getBoundingClientRect();
      const contact = document.querySelector("#contato").getBoundingClientRect();
      return {
        aboutEnd: about.bottom,
        stackEnd: stack.bottom,
        stylesStart: styles.top,
        processEnd: process.bottom,
        gridEnd: grid.bottom,
        contactStart: contact.top,
      };
    });
    assert.ok(bounds.aboutEnd >= bounds.stackEnd, "About contains its full stack");
    assert.ok(bounds.stylesStart >= bounds.stackEnd, "Styles never overlaps About");
    assert.ok(bounds.processEnd >= bounds.gridEnd, "Process contains all four cards");
    assert.ok(bounds.contactStart >= bounds.gridEnd, "Contact never overlaps Process");
    const sticky = await p
      .locator(".story-card")
      .first()
      .evaluate((e) => getComputedStyle(e).position);
    assert.equal(sticky, height >= 600 ? "sticky" : "relative");
    const title = await p.locator("#styles-title em").evaluate((e) => {
      const range = new Range();
      range.selectNodeContents(e);
      const text = range.getBoundingClientRect(),
        parent = e.closest("h2").getBoundingClientRect();
      return { textRight: text.right, parentRight: parent.right, text: e.textContent };
    });
    assert.equal(title.text, "TATUAGEM");
    assert.ok(title.textRight <= title.parentRight + 1, "The final M fits inside the heading");
    const question = p.locator(".portfolio-faq-heading button").first();
    await question.scrollIntoViewIfNeeded();
    await question.tap();
    await p.waitForTimeout(300);
    assert.equal(await question.getAttribute("aria-expanded"), "true");
    assert.ok(
      await p
        .locator(".portfolio-faq-panel")
        .first()
        .evaluate((e) => e.getBoundingClientRect().height > 80),
    );
    await question.tap();
    await p.waitForTimeout(300);
    assert.equal(await question.getAttribute("aria-expanded"), "false");
    assert.ok(
      await p
        .locator(".portfolio-faq-panel")
        .first()
        .evaluate((e) => e.getBoundingClientRect().height < 1),
    );
    assert.equal(await p.locator(".cinematic-atmosphere .atmosphere-canvas").count(), 0);
    const rail = p.locator(".wobble-access-list");
    await p.getByRole("button", { name: "Próximo trabalho", exact: true }).scrollIntoViewIfNeeded();
    await p.getByRole("button", { name: "Próximo trabalho", exact: true }).tap();
    await p.waitForTimeout(600);
    assert.ok(await rail.evaluate((e) => e.scrollLeft > 100), "Native video carousel advances");
    const steps = await p.locator(".process-card").evaluateAll((es) =>
      es.map((e) => ({
        opacity: getComputedStyle(e).opacity,
        x: e.getBoundingClientRect().left,
      })),
    );
    assert.ok(steps.every((e) => e.opacity === "1" && e.x >= 0));
    const play = p.locator(".wobble-access-list button").nth(1);
    await play.scrollIntoViewIfNeeded();
    await play.tap();
    const video = p.getByRole("dialog").locator("video");
    await video.waitFor();
    await p.waitForTimeout(700);
    assert.ok(await video.evaluate((e) => !e.paused && e.currentTime > 0));
    await p.keyboard.press("Escape");
    const expand = p.getByRole("button", { name: "Expandir rodapé" });
    await expand.scrollIntoViewIfNeeded();
    await expand.tap();
    await p.locator(".footer-panel-name").scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    const identity = await p.locator(".footer-panel-name").evaluate((e) => {
      const r = e.getBoundingClientRect(),
        panel = e.closest(".footer-panel").getBoundingClientRect();
      return {
        left: r.left - panel.left,
        right: panel.right - r.right,
        overflow: e.scrollWidth > e.clientWidth,
      };
    });
    assert.ok(
      identity.left >= 20 && identity.right >= 20 && !identity.overflow,
      "Footer name stays inside padding",
    );
    assert.equal(await p.locator(".footer-panel .atmosphere-canvas").count(), 1);
    await p.screenshot({ path: `/tmp/andre-mobile/footer-${width}.png` });
    await p.locator(".footer-panel > button").last().tap();
    await p.getByRole("dialog").waitFor({ state: "detached" });
    for (let i = 0; i < 20; i++) {
      await p.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        i % 2 ? 0 : metrics.height - height,
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
