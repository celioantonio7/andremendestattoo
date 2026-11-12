export const siteUrl = (import.meta.env["VITE_SITE_URL"] || "").replace(/\/+$/, "");
export const siteTitle = "André Mendes | Tatuador em São José dos Campos";
export const siteDescription =
  "Tatuagens autorais de André Mendes em São José dos Campos: realismo, oriental e blackwork. Veja trabalhos reais e converse sobre sua próxima tatuagem.";
export const seoMeta = [
  { title: siteTitle },
  { name: "description", content: siteDescription },
  { name: "author", content: "André Mendes" },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:title", content: siteTitle },
  { property: "og:description", content: siteDescription },
  { property: "og:locale", content: "pt_BR" },
  { property: "og:site_name", content: "André Mendes Tattoo" },
  { property: "og:image", content: siteUrl ? `${siteUrl}/og-cover.jpg` : "/og-cover.jpg" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "800" },
  { property: "og:image:alt", content: "André Mendes e seus trabalhos de tatuagem" },
  { name: "twitter:title", content: siteTitle },
  { name: "twitter:description", content: siteDescription },
  { name: "twitter:image", content: siteUrl ? `${siteUrl}/og-cover.jpg` : "/og-cover.jpg" },
  ...(siteUrl ? [{ property: "og:url", content: `${siteUrl}/` }] : []),
];
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "André Mendes",
  jobTitle: "Tatuador",
  ...(siteUrl ? { url: `${siteUrl}/`, image: `${siteUrl}/og-cover.jpg` } : {}),
  sameAs: ["https://www.instagram.com/andremndes/"],
  knowsAbout: ["Tatuagem realista", "Tatuagem oriental", "Blackwork"],
  workLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "São José dos Campos",
      addressRegion: "SP",
      addressCountry: "BR",
    },
  },
};
