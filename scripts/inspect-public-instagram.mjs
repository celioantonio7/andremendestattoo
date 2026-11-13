import { chromium } from "@playwright/test";
const b = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const p = await b.newPage();
await p.goto("https://www.instagram.com/andremndes/", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await p.waitForTimeout(3000);
console.log(
  await p.evaluate(() => ({
    title: document.title,
    links: Array.from(document.querySelectorAll("a"))
      .map((a) => a.href)
      .filter((h) => /\/(reel|p)\//.test(h)),
    text: document.body.innerText.slice(0, 800),
  })),
);
await b.close();
