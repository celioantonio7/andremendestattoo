import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__smokeDraws = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      const context = original.apply(this, args);
      if (args[0] === "webgl" && context && !context.__tracked) {
        context.__tracked = true;
        const draw = context.drawArrays.bind(context);
        context.drawArrays = (...values) => {
          window.__smokeDraws++;
          return draw(...values);
        };
      }
      return context;
    };
  });
  await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await page.waitForTimeout(3000);
  assert.equal(await page.locator(".carousel-controls").count(), 0);
  assert.equal(
    await page.locator(".hero-section>.smoke-surface").getAttribute("data-ready"),
    "true",
  );
  await page.screenshot({ path: "public/og-cover.jpg", type: "jpeg", quality: 88 });
  await page.evaluate(() =>
    scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await page.waitForTimeout(1200);
  assert.equal(
    await page.locator(".cinematic-atmosphere canvas").getAttribute("data-active"),
    "true",
  );
  const a = await page.evaluate(() => window.__smokeDraws);
  await page.waitForTimeout(600);
  assert.ok((await page.evaluate(() => window.__smokeDraws)) > a);
  await page.screenshot({ path: "/tmp/andre-check/smoke-page-bottom.png" });
  const map = await page.request.get("http://localhost:8081/sitemap.xml");
  assert.equal(map.status(), 200);
  assert.ok((await map.text()).includes("<urlset"));
  assert.deepEqual(errors, []);
  console.log(
    "PASS: no gallery controls, live surface smoke, shader still drawing at page bottom, sitemap returns XML, no browser errors.",
  );
} finally {
  await browser.close();
}
