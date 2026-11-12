import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 754 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => {
    window.__logoDock = [];
    const tick = () => {
      const root = document.querySelector(".preloader");
      const logo = root?.querySelector(".preloader-final-logo img");
      if (root?.getAttribute("data-docking") === "true" && logo) {
        const r = logo.getBoundingClientRect();
        window.__logoDock.push({ x: r.x, y: r.y, width: r.width });
      }
      if (root || !window.__logoDock.length) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await p.goto("http://localhost:8081/?docking=3", { waitUntil: "domcontentloaded" });
  await p.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
  const path = await p.evaluate(() => window.__logoDock);
  assert.ok(path.length > 5, "logo docking animated across frames");
  assert.ok(
    path.at(-1).x < path[0].x - 30 && path.at(-1).y < path[0].y - 30,
    "logo travels toward header",
  );
  assert.ok(path.at(-1).width < path[0].width * 0.5, "logo shrinks into header");
  await p.waitForTimeout(2400);
  assert.equal(
    await p.locator(".hero-carousel .carousel-controls > button").count(),
    0,
    "hero has no arrows or playback controls",
  );
  assert.equal(await p.locator(".hero-socials a").count(), 3);
  assert.doesNotMatch(
    await p
      .locator(".section-meta")
      .allTextContents()
      .then((x) => x.join(" ")),
    /\d+\s*\/\s*06/,
  );
  const label = await p.locator(".hero-topline").boundingBox();
  assert.ok(label.y < 180, "artist label lifted above cards");
  await p.screenshot({ path: "/tmp/andre-check/hero-socials-no-controls.png" });
  const card = p.locator(".story-card").last();
  const pos = await card.evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    sticky: parseFloat(getComputedStyle(el).top),
  }));
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pos.top - pos.sticky + 30);
  await p.waitForTimeout(1000);
  const rect = await card.boundingBox();
  assert.ok(
    Math.abs(rect.y - pos.sticky) < 3,
    `last story aligns: ${JSON.stringify({ rect, pos, scroll: await p.evaluate(() => scrollY) })}`,
  );
  assert.ok(rect.y + rect.height < 754, "last story fits viewport");
  await p.screenshot({ path: "/tmp/andre-check/about-last-aligned.png" });
  await p.close();
  const mobile = await b.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://localhost:8081/?menu=2", { waitUntil: "networkidle" });
  await mobile.locator(".preloader").waitFor({ state: "detached", timeout: 10000 });
  await mobile.waitForTimeout(1200);
  await mobile.getByLabel("Abrir menu", { exact: true }).click();
  const dialog = mobile.getByRole("dialog");
  await dialog.waitFor();
  assert.equal(await dialog.getByRole("navigation").getByRole("link").count(), 6);
  await mobile.waitForTimeout(650);
  await mobile.screenshot({ path: "/tmp/andre-check/mobile-animated-menu.png" });
  await mobile.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  assert.ok(
    await mobile
      .getByLabel("Abrir menu", { exact: true })
      .evaluate((el) => el === document.activeElement),
  );
  await mobile.getByLabel("Abrir menu", { exact: true }).click();
  await mobile.getByRole("dialog").getByRole("link", { name: "Sobre", exact: true }).click();
  await mobile.getByRole("dialog").waitFor({ state: "detached" });
  await mobile.waitForTimeout(1000);
  assert.ok(
    await mobile
      .locator("#sobre")
      .evaluate(
        (el) =>
          Math.abs(
            el.getBoundingClientRect().top -
              parseFloat(getComputedStyle(el).scrollMarginTop || "0") -
              parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop || "0"),
          ) < 3,
      ),
    `menu navigates without restoring scroll: ${await mobile.locator("#sobre").evaluate((el) => el.getBoundingClientRect().top)}`,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: preloader logo docking, hidden hero controls, social rail, no section counts, elevated label, last sticky card fits, animated mobile menu keyboard/focus/navigation.",
  );
} finally {
  await b.close();
}
