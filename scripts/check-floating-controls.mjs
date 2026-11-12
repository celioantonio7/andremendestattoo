import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.scrollTo({ top: 650, behavior: "instant" }));
  await page.waitForTimeout(450);
  assert.equal(
    await page.locator(".site-header").getAttribute("data-hidden"),
    "true",
    "menu hides on downward scroll",
  );
  const hiddenHeader = await page.locator(".site-header").boundingBox();
  assert.ok(hiddenHeader.y + hiddenHeader.height <= 0, "hidden header moves above viewport");
  await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }));
  await page.waitForTimeout(450);
  assert.equal(
    await page.locator(".site-header").getAttribute("data-hidden"),
    "false",
    "menu appears on upward scroll",
  );
  const whats = page.getByRole("link", { name: "WhatsApp — contato e agendamento" });
  await whats.waitFor();
  assert.equal(
    await whats.evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  const before = await whats.boundingBox();
  await page.mouse.move(before.x + 30, before.y + 30);
  await page.mouse.down();
  await page.mouse.move(before.x - 170, before.y - 110, { steps: 12 });
  await page.mouse.up();
  const after = await whats.boundingBox();
  assert.ok(Math.abs(after.x - before.x) > 100);
  assert.ok(Math.abs(after.y - before.y) > 50);
  assert.ok(!page.url().endsWith("#contato"), "drag never activates link");
  await whats.focus();
  await page.keyboard.press("Alt+ArrowLeft");
  const keyed = await whats.boundingBox();
  assert.ok(keyed.x < after.x, "keyboard moves floating control");
  await page.keyboard.press("Escape");
  const reset = await whats.boundingBox();
  assert.ok(reset.x > after.x, "Escape resets floating control");
  console.log(
    "PASS: header direction visibility; transparent WhatsApp SVG; mouse dragging; drag click suppression; keyboard reposition and reset.",
  );
} finally {
  await browser.close();
}
