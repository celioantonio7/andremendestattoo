import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("/tmp/andre-check", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  for (const width of [1440, 390]) {
    const height = width === 1440 ? 900 : 844;
    const page = await browser.newPage({ viewport: { width, height } });
    let moduleUrl;
    const errors = [];
    page.on("request", (request) => {
      if (/gsap_ScrollTrigger\.js\?/.test(request.url())) moduleUrl = request.url();
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:8081/#processo");
    await page.locator(".preloader").waitFor({ state: "detached", timeout: 20000 });
    await page.waitForTimeout(1700);
    const pins = await page.evaluate(async (url) => {
      const { ScrollTrigger } = await import(url);
      return Object.fromEntries(
        ["about-pin", "reels-pin", "process-pin"].map((id) => {
          const pin = ScrollTrigger.getById(id);
          return [id, { start: pin.start, end: pin.end }];
        }),
      );
    }, moduleUrl);
    const initialY = await page.evaluate(() => scrollY);
    assert.ok(
      Math.abs(initialY - pins["process-pin"].start) < 130,
      "Cold #processo entry must account for all upstream pin spacers",
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    const wheelTo = async (target) => {
      for (let i = 0; i < 140; i++) {
        const y = await page.evaluate(() => scrollY);
        if (Math.abs(target - y) < 3) {
          await page.waitForTimeout(750);
          if (Math.abs(target - (await page.evaluate(() => scrollY))) < 3) return;
          continue;
        }
        await page.mouse.wheel(0, Math.max(-900, Math.min(900, target - y)));
        await page.waitForTimeout(220);
      }
      throw new Error(`Wheel navigation failed to reach ${target}`);
    };
    const mosaic = await page.locator(".detail-mosaic").evaluate((el) => ({
      start: el.getBoundingClientRect().top + scrollY,
      end: el.getBoundingClientRect().bottom + scrollY - innerHeight,
    }));
    const checkpoints = [
      { name: "about", selector: "#sobre", y: pins["about-pin"].start + 300 },
      { name: "about-final", selector: "#sobre", y: pins["about-pin"].end - 100 },
      { name: "reels", selector: ".wobble-stage", y: pins["reels-pin"].start + 300 },
      { name: "reels-final", selector: ".wobble-stage", y: pins["reels-pin"].end - 100 },
      {
        name: "mosaic",
        selector: ".mosaic-stage",
        y: mosaic.start + (mosaic.end - mosaic.start) * 0.65,
      },
      { name: "mosaic-final", selector: ".mosaic-stage", y: mosaic.end - 100 },
      { name: "process", selector: "#processo", y: pins["process-pin"].start + 300 },
      { name: "process-final", selector: "#processo", y: pins["process-pin"].end - 100 },
    ];
    for (const direction of ["down", "up"]) {
      for (const checkpoint of direction === "down" ? checkpoints : [...checkpoints].reverse()) {
        await wheelTo(Math.round(checkpoint.y));
        const box = await page.locator(checkpoint.selector).boundingBox();
        if (Math.abs(box.y) >= 4)
          console.log(
            "checkpoint-failure",
            checkpoint,
            await page.evaluate(async (url) => {
              const { ScrollTrigger } = await import(url);
              return {
                y: scrollY,
                pins: ScrollTrigger.getAll()
                  .filter((t) => t.pin)
                  .map((t) => ({
                    id: t.vars.id,
                    start: t.start,
                    end: t.end,
                    top: t.trigger.getBoundingClientRect().top,
                  })),
              };
            }, moduleUrl),
          );
        assert.ok(
          Math.abs(box.y) < 4,
          `${direction} ${checkpoint.name}: scene should remain pinned, got ${box.y}`,
        );
        const active = await page.evaluate(async (url) => {
          const { ScrollTrigger } = await import(url);
          return ScrollTrigger.getAll()
            .filter((trigger) => trigger.pin && trigger.isActive)
            .map((trigger) => trigger.vars.id);
        }, moduleUrl);
        assert.ok(
          active.length <= 1,
          `${direction} ${checkpoint.name}: pinned sections must not overlap`,
        );
        if (checkpoint.name.startsWith("mosaic")) {
          assert.equal(await page.locator(".detail-mosaic").getAttribute("data-expanded"), "true");
          const focus = await page.locator(".mosaic-focus").boundingBox();
          assert.ok(focus.width >= width - 4, "Zoom reaches full width before serpentine runs");
        }
        await page.screenshot({
          path: `/tmp/andre-check/pin-sweep-${width}-${checkpoint.name}-${direction}.png`,
        });
      }
    }
    for (const id of ["sobre", "portfolio", "processo"]) {
      await page.evaluate(() =>
        scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
      );
      await page.locator(".footer-expand").click();
      await page.locator(`.footer-panel-links a[href="#${id}"]`).click();
      await page.waitForTimeout(1600);
      const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(
        top >= -4 && top < 140,
        `Footer navigation #${id} should show section start, got ${top}`,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        width,
        coldHash: "aligned",
        wheel: "all 4 scenes down and up",
        footerNavigation: "sobre/portfolio/processo aligned",
        screenshots: checkpoints.length * 2,
        pins,
        errors,
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
