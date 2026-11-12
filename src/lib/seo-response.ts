import { siteUrl } from "./seo";
export function seoResponse(request: Request): Response | null {
  const url = new URL(request.url);
  const origin = siteUrl || url.origin;
  if (url.pathname === "/robots.txt")
    return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  if (url.pathname !== "/sitemap.xml") return null;
  const safe = `${origin}/`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${safe}</loc></url></urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
