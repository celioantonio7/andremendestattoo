import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await page.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await page.waitForTimeout(3000);
  assert.equal(await page.locator(".hero-carousel .carousel-controls").count(), 0);
  assert.equal(
    await page.getByText("TATUAGENS AUTORAIS QUE CONTAM HISTÓRIAS.", { exact: true }).count(),
    0,
  );
  assert.equal(await page.locator(".autoplay-button").count(), 0);
  assert.equal(
    await page.locator(".hero-edition").evaluate((e) => getComputedStyle(e).color),
    "rgb(255, 242, 223)",
  );
  assert.equal(
    await page
      .locator(".cta")
      .first()
      .evaluate((e) => getComputedStyle(e).backdropFilter),
    "blur(12px) saturate(1.25)",
  );
  assert.equal(
    await page.locator(".header-booking").evaluate((e) => getComputedStyle(e).backdropFilter),
    "blur(12px) saturate(1.25)",
  );
  await page.screenshot({ path: "/tmp/andre-check/polished-hero.png" });
  const gallery = page.locator(".gallery-carousel");
  await gallery.evaluate((e) =>
    scrollTo({ top: e.getBoundingClientRect().top + scrollY - 250, behavior: "instant" }),
  );
  await page.mouse.move(700, 100);
  await page.waitForTimeout(2000);
  const position = () =>
    gallery.locator(".embla-track").evaluate((e) => getComputedStyle(e).transform);
  const before = await position();
  await page.waitForTimeout(600);
  assert.notEqual(before, await position());
  const hit = await page.evaluate(() => {
    for (let y = 300; y < 700; y += 20)
      for (let x = 120; x < 1300; x += 20) {
        const e = document.elementFromPoint(x, y);
        if (e?.tagName === "IMG" && e.closest(".gallery-carousel .artwork-button")) return { x, y };
      }
  });
  assert.ok(hit);
  await page.mouse.move(hit.x, hit.y);
  await page.waitForTimeout(300);
  assert.equal(await gallery.getAttribute("data-autoplay"), "false");
  const still = await position();
  await page.waitForTimeout(300);
  assert.equal(still, await position());
  await page.mouse.move(700, 100);
  await page.waitForTimeout(300);
  assert.equal(await gallery.getAttribute("data-autoplay"), "true");
  await page.screenshot({ path: "/tmp/andre-check/polished-gallery.png" });
  for (const id of ["sobre", "estilos", "contato"]) {
    await page
      .locator(`#${id}`)
      .evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY - 50, behavior: "instant" }),
      );
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `/tmp/andre-check/polished-${id}.png` });
  }
  assert.deepEqual(errors, []);
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto("http://localhost:8081", { waitUntil: "domcontentloaded" });
  await mobile.locator(".preloader").waitFor({ state: "detached", timeout: 15000 });
  await mobile.waitForTimeout(3000);
  await mobile.screenshot({ path: "/tmp/andre-check/polished-mobile-hero.png" });
  await mobile.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await mobile.getByRole("dialog").getByRole("link", { name: "Sobre", exact: true }).click();
  await mobile.waitForTimeout(1800);
  assert.equal(new URL(mobile.url()).hash, "#sobre");
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  console.log(
    "PASS: hero removals, contrast, glass, continuous gallery, exact-image hover, section scenes, mobile navigation, no browser errors.",
  );
} finally {
  await browser.close();
}
