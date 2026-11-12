import { describe, expect, it } from "vitest";
import { seoResponse } from "@/lib/seo-response";
describe("SEO endpoints", () => {
  it("lists only the canonical document, without treating section anchors as pages", async () => {
    const response = seoResponse(new Request("https://portfolio.test/sitemap.xml"));
    expect(response?.headers.get("content-type")).toContain("application/xml");
    const xml = await response!.text();
    expect(xml).toContain("<loc>https://portfolio.test/</loc>");
    expect(xml.match(/<url>/g)).toHaveLength(1);
    expect(xml).not.toContain("#");
  });
  it("advertises a same-origin sitemap to crawlers", async () => {
    const response = seoResponse(new Request("https://portfolio.test/robots.txt"));
    expect(await response!.text()).toContain("Sitemap: https://portfolio.test/sitemap.xml");
  });
  it("leaves application paths to the router", () => {
    expect(seoResponse(new Request("https://portfolio.test/"))).toBeNull();
  });
});
