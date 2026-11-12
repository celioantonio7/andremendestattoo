import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
const base = process.env["PAGES_BASE"] || "/";
export default defineConfig({
  base,
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    {
      name: "public-asset-base",
      enforce: "pre",
      transform(code, id) {
        if (!/\/src\/.*\.[jt]sx?$/.test(id) || base === "/") return;
        return code.replace(/(["'`])\/(art|works)\//g, `$1${base}$2/`);
      },
    },
    tailwindcss(),
    react(),
  ],
  build: { outDir: "dist-pages", rollupOptions: { input: "pages.html" } },
});
