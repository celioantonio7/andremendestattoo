import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  ...(process.env["CHROME_PATH"] ? { executablePath: process.env["CHROME_PATH"] } : {}),
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
await mkdir("/tmp/andre-check", { recursive: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("response", (res) => {
  if (res.status() >= 400 && res.url().includes("localhost"))
    errors.push(`${res.status()} ${res.url()}`);
});
await page.addInitScript(() => {
  window.__smokeDraws = 0;
  const draw = WebGLRenderingContext.prototype.drawArrays;
  WebGLRenderingContext.prototype.drawArrays = function (...args) {
    window.__smokeDraws++;
    return draw.apply(this, args);
  };
});
try {
  await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 9000 });
  await page.waitForTimeout(2800);
  assert.equal(await page.locator("main section").count(), 6);
  assert.equal(await page.locator('canvas[data-ready="true"]').count(), 1);
  const draws = await page.evaluate(() => window.__smokeDraws);
  await page.waitForTimeout(250);
  assert.ok(
    (await page.evaluate(() => window.__smokeDraws)) > draws,
    "shader must continue drawing",
  );
  assert.equal(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      )
      .then((x) => x.length),
    0,
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hiddenDraws = await page.evaluate(() => window.__smokeDraws);
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => window.__smokeDraws),
    hiddenDraws,
    "shader pauses in hidden tab",
  );
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(250);
  assert.ok(
    (await page.evaluate(() => window.__smokeDraws)) > hiddenDraws,
    "shader resumes when tab returns",
  );
  await page.screenshot({ path: "/tmp/andre-check/desktop-hero.png" });
  const selected = () => page.locator(".hero-carousel .is-selected").getAttribute("aria-label");
  const before = await selected();
  await page.mouse.move(700, 100);
  await page.waitForTimeout(3800);
  assert.notEqual(await selected(), before, "autoplay advances");
  const hoveredTrack = await page.locator(".hero-carousel .embla-viewport").boundingBox();
  await page.mouse.move(
    hoveredTrack.x + hoveredTrack.width * 0.15,
    hoveredTrack.y + hoveredTrack.height * 0.5,
  );
  await page.waitForTimeout(200);
  const paused = await selected();
  await page.waitForTimeout(1500);
  assert.equal(await selected(), paused, "hover stops autoplay");
  await page.locator(".hero-carousel .carousel-dots button").nth(3).click();
  await page.waitForTimeout(800);
  assert.equal(
    await page.locator(".hero-carousel .carousel-dots button").nth(3).getAttribute("aria-pressed"),
    "true",
    "manual carousel selection",
  );
  for (const id of ["sobre", "estilos", "portfolio", "processo", "contato"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `/tmp/andre-check/desktop-${id}.png` });
  }
  assert.equal(
    await page
      .locator(".story-card")
      .first()
      .evaluate((el) => getComputedStyle(el).position),
    "sticky",
  );
  await page.locator("#portfolio").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  const openButton = page.locator(".gallery-carousel .is-selected .artwork-button");
  await openButton.click();
  await page.getByRole("dialog").waitFor();
  const title = await page.getByRole("dialog").locator("h2").textContent();
  await page.keyboard.press("ArrowRight");
  assert.notEqual(await page.getByRole("dialog").locator("h2").textContent(), title);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.ok(
    (await page.locator(".gallery-carousel .artwork-button:focus").count()) > 0,
    "lightbox restores focus",
  );
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await page
    .getByLabel("Conte sua ideia")
    .fill("Um dragão oriental no braço, aproximadamente 20 cm.");
  await page.getByRole("button", { name: "Copiar briefing" }).click();
  await page.waitForTimeout(150);
  assert.match(await page.getByRole("status").textContent(), /Ideia copiada|Selecione o texto/);
  assert.equal(await page.locator('a[href*="5511999999999"]').count(), 0);
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(2400);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `no document overflow at ${width}`,
    );
    if (width === 390) {
      await page.screenshot({ path: "/tmp/andre-check/mobile-hero.png" });
      await page.getByLabel("Abrir menu", { exact: true }).click();
      assert.equal(await page.getByRole("navigation").isVisible(), true);
      await page.getByRole("navigation").getByText("Sobre", { exact: true }).click();
      assert.equal(
        await page.getByLabel("Abrir menu", { exact: true }).getAttribute("aria-expanded"),
        "false",
      );
      for (const id of ["sobre", "estilos", "portfolio", "processo", "contato"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(900);
        await page.screenshot({ path: `/tmp/andre-check/mobile-${id}.png` });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('canvas[data-ready="true"]').count(), 0);
  const reduced = await selected();
  await page.waitForTimeout(3700);
  assert.equal(await selected(), reduced, "reduced motion disables autoplay");
  assert.equal(await page.locator("h1").isVisible(), true);
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl") return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto("http://localhost:8080", { waitUntil: "networkidle" });
  await fallback.waitForTimeout(2500);
  assert.equal(await fallback.locator("h1").isVisible(), true);
  assert.equal(await fallback.locator("main section").count(), 6);
  await fallback.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: six sections, shader frames, images, autoplay, pause, manual navigation, sticky cards, lightbox keyboard/focus, briefing, responsive widths, mobile menu, reduced motion, WebGL fallback, no page errors.",
  );
  console.log("Screenshots: /tmp/andre-check");
} finally {
  await browser.close();
}
