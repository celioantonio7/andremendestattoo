import { build, createServer } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
const origin = process.env.VITE_SITE_URL?.replace(/\/+$/, "");
if (!origin || !/^https:\/\//.test(origin))
  throw new Error("Defina VITE_SITE_URL com a URL HTTPS completa do GitHub Pages.");
const base = process.env.PAGES_BASE || "/";
await build({ configFile: "vite.pages.config.ts" });
const server = await createServer({
  configFile: "vite.pages.config.ts",
  server: { middlewareMode: true },
});
try {
  const { Route } = await server.ssrLoadModule("/src/routes/index.tsx");
  const { seoMeta, structuredData } = await server.ssrLoadModule("/src/lib/seo.ts");
  const escape = (s) =>
    String(s).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  const metas = seoMeta
    .map((meta) =>
      meta.title
        ? `<title>${escape(meta.title)}</title>`
        : `<meta ${meta.property ? "property" : "name"}="${escape(meta.property || meta.name)}" content="${escape(meta.content)}" />`,
    )
    .join("\n");
  const seo = `${metas}\n<meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/><link rel="canonical" href="${escape(origin)}/"/><script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>`;
  const markup = renderToString(createElement(Route.options.component));
  let html = await readFile("dist-pages/pages.html", "utf8");
  html = html
    .replace("<!-- PORTFOLIO_SEO -->", seo)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  await writeFile("dist-pages/index.html", html);
  const { NotFoundPage } = await server.ssrLoadModule("/src/components/portfolio/NotFoundPage.tsx");
  const missingMarkup = renderToString(createElement(NotFoundPage));
  const missingHtml = html
    .replace(`<div id="root">${markup}</div>`, `<div id="root">${missingMarkup}</div>`)
    .replace(/<title>.*?<\/title>/, "<title>Página não encontrada | André Mendes</title>")
    .replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
  await writeFile("dist-pages/404.html", missingHtml);
  await writeFile("dist-pages/.nojekyll", "");
  await writeFile(
    "dist-pages/robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(
    "dist-pages/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>\n`,
  );
  console.log(`GitHub Pages: dist-pages/index.html — ${origin}/ (base ${base})`);
} finally {
  await server.close();
}
