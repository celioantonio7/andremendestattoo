import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({ viewport: { width: 768, height: 480 } });
await page.goto("http://localhost:8084");
await page.setContent(
  '<body style="margin:0;background:black"><video muted src="http://localhost:8084/reference.mp4" style="width:768px;height:480px" preload="auto"></video></body>',
);
await page.locator("video").evaluate(
  (v) =>
    new Promise((resolve, reject) => {
      v.onloadeddata = resolve;
      v.onerror = () => reject(v.error?.message);
      v.load();
    }),
);
for (const time of [0, 2, 4, 6, 8, 10, 12, 14]) {
  await page.locator("video").evaluate(
    (v, t) =>
      new Promise((resolve) => {
        v.onseeked = resolve;
        v.currentTime = t + 0.01;
      }),
    time,
  );
  await page.screenshot({ path: `/tmp/andre-video/frame-${time}.png` });
}
console.log("Decoded eight frames");
await browser.close();
