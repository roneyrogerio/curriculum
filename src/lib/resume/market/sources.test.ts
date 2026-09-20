import { describe, expect, it } from "vitest";
import { CURRENCIES } from "./types";
import { KNOWN_MARKETS, searchToolFor } from "./sources";

describe("the currencies a band may be quoted in", () => {
  it("can be formatted, every one of them", () => {
    // The panel prints straight from this code; an unformattable one would be
    // a thrown error on a rendered page rather than a bad number.
    for (const currency of CURRENCIES) {
      expect(() =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(1000)
      ).not.toThrow();
    }
  });

  it("covers the markets the source lists know about", () => {
    // A country worth searching in is a country worth quoting in.
    expect(CURRENCIES).toContain("BRL");
    expect(CURRENCIES).toContain("EUR");
    expect(CURRENCIES).toContain("USD");
  });
});

describe("where a salary may be looked up", () => {
  it("restricts a Brazilian lookup to Brazilian sources, and locates it there", () => {
    const tool: any = searchToolFor("Brasil");
    expect(tool.filters.allowed_domains).toContain("glassdoor.com.br");
    expect(tool.filters.allowed_domains).toContain("roberthalf.com.br");
    expect(tool.user_location).toEqual({
      type: "approximate",
      country: "BR",
      timezone: "America/Sao_Paulo"
    });
  });

  it("does not answer a Brazilian job with American sources", () => {
    const brazil: any = searchToolFor("Brasil");
    expect(brazil.filters.allowed_domains).not.toContain("levels.fyi");
    expect(brazil.filters.allowed_domains).not.toContain("glassdoor.com");
  });

  it("reads the country however the plan happened to capitalise it", () => {
    expect(searchToolFor("brasil")).toEqual(searchToolFor("  BRASIL "));
  });

  it("searches the open web for a market it has no list for, rather than nothing", () => {
    const tool: any = searchToolFor("Japão");
    expect(tool.filters).toBeUndefined();
    expect(tool.user_location).toBeUndefined();
    expect(tool.type).toBe("web_search");
  });

  it("gives every market both an employer source and a salary guide", () => {
    for (const market of KNOWN_MARKETS) {
      const tool: any = searchToolFor(market);
      const domains: string[] = tool.filters.allowed_domains;
      // Both kinds are needed: a guide carries the band, an employer-review
      // site carries the company, and the company is what weighs double.
      expect(domains.some((domain) => domain.includes("glassdoor"))).toBe(true);
      expect(domains.length).toBeGreaterThanOrEqual(5);
      // Domains, not URLs: a prefix here silently matches nothing.
      for (const domain of domains) expect(domain).not.toMatch(/^https?:|\/$|[A-Z]/);
    }
  });
});
