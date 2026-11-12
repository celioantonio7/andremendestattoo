import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Route } from "@/routes/index";

describe("André Mendes portfolio", () => {
  it("renders the six distinct sections and the supplied portrait only once", () => {
    const html = renderToStaticMarkup(
      createElement(Route.options.component as React.ComponentType),
    );
    for (const id of ["inicio", "sobre", "estilos", "portfolio", "processo", "contato"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html.match(/alt="André Mendes, tatuador artístico"/g)).toHaveLength(1);
    expect(html).not.toContain("Dark House");
  });
  it("uses the verified artist profile and a cinematic closing sequence", () => {
    const html = renderToStaticMarkup(
      createElement(Route.options.component as React.ComponentType),
    );
    expect(html).toContain("https://www.instagram.com/andremndes/");
    expect(html).toContain("https://wa.me/5512997389289");
    expect(html).toContain("dive-sequence");
    expect(html).toContain("Expandir rodapé");
    expect(html).toContain("/works/work-1.webp");
  });
  it("never sends visitors to the former fictional booking number", () => {
    const html = renderToStaticMarkup(
      createElement(Route.options.component as React.ComponentType),
    );
    expect(html).not.toContain("5511999999999");
    expect(html).not.toContain("Rua Exemplo");
  });
});
