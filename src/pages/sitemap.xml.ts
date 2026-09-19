import type { APIRoute } from "astro";
import { allLocales } from "../data";
import { siteUrl } from "../data/site";

const lastmod = new Date().toISOString().slice(0, 10);

/**
 * Lists the language selector plus both readable versions. The print routes are
 * left out: they carry a noindex meta tag and canonicalize to the site version.
 */
export const GET: APIRoute = () => {
  const alternates = allLocales
    .map(
      (locale) =>
        `<xhtml:link rel="alternate" hreflang="${locale === "pt-br" ? "pt-BR" : "en-US"}" href="${siteUrl}/${locale}/"/>`
    )
    .join("");

  const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/"/>`;

  const gate = `  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${alternates}${xDefault}
  </url>`;

  const urls = allLocales
    .map(
      (locale) => `  <url>
    <loc>${siteUrl}/${locale}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${locale === "pt-br" ? "1.0" : "0.9"}</priority>
    ${alternates}${xDefault}
  </url>`
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${gate}
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
