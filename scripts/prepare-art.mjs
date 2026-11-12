import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const generated = "/home/celio/.codex/generated_images/01a1cf8d-594d-7fd2-bead-8171307869eb/";
await mkdir("public/art", { recursive: true });
const sheet = generated + "exec-f0e352f3-64dc-4e3f-b626-00cd641a08e3.png";
const { width, height } = await sharp(sheet).metadata();
const cellWidth = Math.floor(width / 3),
  cellHeight = Math.floor(height / 2);
for (const [i, name] of ["lion", "dragon", "mandala", "sculpture", "hannya", "machine"].entries()) {
  await sharp(sheet)
    .extract({
      left: (i % 3) * cellWidth,
      top: Math.floor(i / 3) * cellHeight,
      width: cellWidth,
      height: cellHeight,
    })
    .webp({ quality: 90 })
    .toFile(`public/art/${name}.webp`);
}
await import("./restore-portrait.mjs");
const lettering = generated + "exec-6225e058-f681-4a72-a0de-2836e5793f41.png";
const meta = await sharp(lettering).metadata();
for (const [i, name] of ["andre", "mendes"].entries()) {
  const row = await sharp(lettering)
    .extract({
      left: 0,
      top: i * Math.floor(meta.height / 2),
      width: meta.width,
      height: Math.floor(meta.height / 2),
    })
    .png()
    .toBuffer();
  await sharp(row)
    .trim({ background: "#00000000", threshold: 5 })
    .resize({ width: 1100, withoutEnlargement: true })
    .webp({ quality: 94, alphaQuality: 100 })
    .toFile(`public/art/${name}-lettering.webp`);
}
await sharp(generated + "exec-d275c270-305d-4b74-bd64-216c10cece9b.png")
  .trim({ background: "#00000000", threshold: 10 })
  .resize({ width: 420 })
  .webp({ quality: 96, alphaQuality: 100 })
  .toFile("public/art/am-logo.webp");
console.log("Prepared original portrait + lettering, six art textures and AM logo.");
