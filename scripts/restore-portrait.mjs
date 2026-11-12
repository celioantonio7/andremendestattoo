import sharp from "sharp";

// Only the alpha silhouette comes from the cutout; every RGB pixel comes from the supplied photo.
const mask =
  "/home/celio/.codex/generated_images/01a1cf8d-594d-7fd2-bead-8171307869eb/exec-49f097db-8cef-4684-bd8a-aa33317557d6.png";
const { data, info } = await sharp(mask)
  .ensureAlpha()
  .extractChannel(3)
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const outside = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0,
  tail = 0;
const visit = (index) => {
  if (!outside[index] && data[index] < 128) {
    outside[index] = 1;
    queue[tail++] = index;
  }
};
for (let x = 0; x < width; x++) {
  visit(x);
  visit((height - 1) * width + x);
}
for (let y = 0; y < height; y++) {
  visit(y * width);
  visit(y * width + width - 1);
}
while (head < tail) {
  const index = queue[head++],
    x = index % width,
    y = Math.floor(index / width);
  if (x > 0) visit(index - 1);
  if (x < width - 1) visit(index + 1);
  if (y > 0) visit(index - width);
  if (y < height - 1) visit(index + width);
}
const alpha = Buffer.from(data);
for (let y = 1; y < height - 1; y++)
  for (let x = 1; x < width - 1; x++) {
    const i = y * width + x;
    if (
      !outside[i] &&
      !outside[i - 1] &&
      !outside[i + 1] &&
      !outside[i - width] &&
      !outside[i + width]
    )
      alpha[i] = 255;
  }
const rgb = await sharp("public/andremendes.png").removeAlpha().raw().toBuffer();
const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  rgba[i * 4] = rgb[i * 3];
  rgba[i * 4 + 1] = rgb[i * 3 + 1];
  rgba[i * 4 + 2] = rgb[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}
await sharp(rgba, { raw: { width, height, channels: 4 } })
  .extract({ left: 0, top: 216, width, height: height - 216 })
  .webp({ lossless: true, alphaQuality: 100 })
  .toFile("public/art/andre-cutout.webp");
console.log("Original RGB and silhouette alpha interleaved explicitly; transparent crop exported.");
