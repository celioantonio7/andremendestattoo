import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext();
const results = [];
try {
  for (const [index, code] of ["DdKgm_spUkz", "DdAIuouJJW4", "Dc6LjluRHpu"].entries()) {
    const page = await context.newPage();
    const source = `https://www.instagram.com/andremndes/reel/${code}/`;
    await page.goto(source, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1300);
    const data = await page.evaluate((code) => {
      const matches = [];
      function walk(n) {
        if (!n || typeof n !== "object") return;
        if ((n.code === code || n.shortcode === code) && n.image_versions2?.candidates?.length)
          matches.push(n);
        for (const v of Object.values(n)) if (typeof v === "object") walk(v);
      }
      for (const script of document.querySelectorAll('script[type="application/json"]')) {
        try {
          walk(JSON.parse(script.textContent));
        } catch {}
      }
      const post = matches.find((p) => p.user?.username === "andremndes") || matches[0];
      if (!post) return null;
      const image = [...post.image_versions2.candidates].sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[0];
      return { image, caption: post.caption?.text || "", video: post.video_versions?.[0]?.url };
    }, code);
    if (!data) throw new Error(`No public photo candidate for ${code}`);
    const response = await context.request.get(data.image.url, {
      headers: { Referer: "https://www.instagram.com/" },
    });
    if (!response.ok()) throw new Error(`Media HTTP ${response.status()}`);
    const file = `detail-${index + 1}.webp`;
    await sharp(await response.body())
      .webp({ quality: 95 })
      .toFile(`public/works/${file}`);
    results.push({
      file,
      source,
      width: data.image.width,
      height: data.image.height,
      description: data.caption,
    });
    console.log(file, data.image.width, data.image.height, data.caption.slice(0, 120));
    await page.close();
  }
  await writeFile("public/works/detail-sources.json", JSON.stringify(results, null, 2) + "\n");
} finally {
  await browser.close();
}
