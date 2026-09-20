import { describe, expect, it } from "vitest";
import { KNOWN_MARKETS, marketsByKey, resolveMarket, searchToolFor } from "./sources";
import { CURRENCIES } from "./types";

describe("the market pointed to by the named country", () => {
  /*
   * The model decides the country after reading the entire posting. An earlier
   * version checked its answer against the text language and discarded it when
   * they disagreed — and a Brazilian posting with "estamos" and "buscamos" in
   * the body was enough to be classified as Spanish. What is tested here is
   * translating a country name into a market, which is all the code remains
   * responsible for.
   */
  it("translates the country into currency, timezone, and sources", () => {
    expect(resolveMarket("Brasil")).toMatchObject({ country: "Brasil", currency: "BRL" });
    expect(resolveMarket("Reino Unido")).toMatchObject({ country: "Reino Unido", currency: "GBP" });
  });

  it("reads the country however the model wrote it", () => {
    for (const written of ["Estados Unidos", "EUA", "United States", "  usa  ", "US"]) {
      expect(resolveMarket(written)?.country).toBe("Estados Unidos");
    }
    expect(resolveMarket("España")?.country).toBe("Espanha");
    expect(resolveMarket("Espanha")?.country).toBe("Espanha");
    expect(resolveMarket("poland")?.country).toBe("Polônia");
  });

  it("does not turn Canada into the United States", () => {
    // A senior engineer costs 25-30% less there, and .ca sites publish that data.
    const canada = resolveMarket("Canadá")!;
    expect(canada.currency).toBe("CAD");
    expect(canada.employers).toContain("glassdoor.ca");
    expect(canada.employers).not.toContain("glassdoor.com");
  });

  it("returns null for a country without its own sources list", () => {
    // The search falls back to the open web: worse than a targeted list, better
    // than the wrong market. Substituting Japan with a default would price the job in another country.
    expect(resolveMarket("Japão")).toBeNull();
    expect(resolveMarket("Índia")).toBeNull();
    expect(resolveMarket("")).toBeNull();
  });
});

describe("the search tool, aimed at one market", () => {
  it("restricts retrieval to that market's sources and locates it there", () => {
    const tool: any = searchToolFor(resolveMarket("Brasil"));
    expect(tool.filters.allowed_domains).toContain("glassdoor.com.br");
    expect(tool.filters.allowed_domains).toContain("michaelpage.com.br");
    expect(tool.user_location).toMatchObject({ country: "BR", timezone: "America/Sao_Paulo" });
  });

  it("does not answer a Brazilian job with American sources", () => {
    const tool: any = searchToolFor(resolveMarket("Brasil"));
    expect(tool.filters.allowed_domains).not.toContain("levels.fyi");
    expect(tool.filters.allowed_domains).not.toContain("glassdoor.com");
  });

  it("searches the open web for an unknown market, rather than nothing", () => {
    const tool: any = searchToolFor(null);
    expect(tool.filters).toBeUndefined();
    expect(tool.user_location).toBeUndefined();
    expect(tool.type).toBe("web_search");
  });
});

describe("keys and names, which are not the same thing", () => {
  it("uses normalized keys: lowercase without accents", () => {
    // The key is what `normalise` produces. An accented key would work
    // through the alias path but break on direct access.
    for (const key of KNOWN_MARKETS) {
      expect(key).toBe(key.toLowerCase());
      expect(key.normalize("NFD")).toBe(key);
    }
  });

  it("preserves the properly written name for text output", () => {
    // The search term and prompt carry this name; "polonia" and "mexico" there
    // read like typos.
    expect(resolveMarket("poland")?.country).toBe("Polônia");
    expect(resolveMarket("mexico")?.country).toBe("México");
    expect(resolveMarket("netherlands")?.country).toBe("Países Baixos");
    expect(resolveMarket("canada")?.country).toBe("Canadá");
  });
});

describe("the source lists themselves", () => {
  it("gives every market a guide and a place the employer shows up", () => {
    for (const key of KNOWN_MARKETS) {
      const market = marketsByKey[key];
      // Both kinds are needed: a guide carries the band, an employer site
      // carries the company, and the company is 40% of the answer.
      expect(market.guides.length).toBeGreaterThanOrEqual(3);
      expect(market.employers.length).toBeGreaterThanOrEqual(3);
      expect(market.employers.some((domain) => domain.includes("linkedin"))).toBe(true);
    }
  });

  it("quotes every market in a currency the panel can format", () => {
    for (const key of KNOWN_MARKETS) {
      expect(CURRENCIES).toContain(marketsByKey[key].currency as any);
    }
  });

  it("lists domains, not URLs: a prefix here silently matches nothing", () => {
    for (const key of KNOWN_MARKETS) {
      const market = marketsByKey[key];
      for (const domain of [...market.guides, ...market.employers]) {
        expect(domain).not.toMatch(/^https?:|\/|[A-Z]|\s/);
        expect(domain).toMatch(/\./);
      }
    }
  });

  it("does not list a source that redirects out of its own market", () => {
    // Checked over HTTPS: these three all land on the American Robert Half,
    // so allowlisting them buys an American band for a local job.
    for (const key of KNOWN_MARKETS) {
      const all = [...marketsByKey[key].guides, ...marketsByKey[key].employers];
      expect(all).not.toContain("roberthalf.com.br");
      expect(all).not.toContain("roberthalf.ca");
      expect(all).not.toContain("roberthalf.co.uk");
      // Dead as of this writing, and a dead domain in an allowlist is a
      // search that quietly returns less.
      expect(all).not.toContain("honeypot.io");
      expect(all).not.toContain("glassdoor.com.co");
    }
  });
});
