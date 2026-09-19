import { describe, expect, it } from "vitest";
import { GET } from "../pages/sitemap.xml";
import { allLocales } from "../data";

async function body() {
  const response = await GET({} as Parameters<typeof GET>[0]);
  return await (response as Response).text();
}

describe("sitemap", () => {
  it("serves XML", async () => {
    const response = (await GET({} as Parameters<typeof GET>[0])) as Response;
    expect(response.headers.get("Content-Type")).toContain("xml");
  });

  it("lists the language selector plus every locale", async () => {
    const xml = await body();
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locations).toContain("https://roneyrogerio.dev/");
    allLocales.forEach((locale) => {
      expect(locations).toContain(`https://roneyrogerio.dev/${locale}/`);
    });
    expect(locations).toHaveLength(allLocales.length + 1);
  });

  it("leaves the noindex print routes out", async () => {
    expect(await body()).not.toContain("/print/");
  });

  it("points x-default at the selector, as Google documents for it", async () => {
    const xml = await body();
    const xDefaults = [...xml.matchAll(/hreflang="x-default" href="([^"]+)"/g)].map((m) => m[1]);
    expect(xDefaults.length).toBeGreaterThan(0);
    xDefaults.forEach((href) => expect(href).toBe("https://roneyrogerio.dev/"));
  });

  it("declares both languages on every entry, which hreflang requires", async () => {
    const xml = await body();
    const urls = xml.split("<url>").slice(1);
    urls.forEach((url) => {
      expect(url).toContain('hreflang="pt-BR"');
      expect(url).toContain('hreflang="en-US"');
    });
  });
});
