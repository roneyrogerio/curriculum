import { describe, expect, it } from "vitest";
import { KNOWN_MARKETS, marketsByKey, resolveMarket, searchToolFor } from "./sources";
import { CURRENCIES } from "./types";

describe("the market a posting is priced in", () => {
  it("takes the country the plan read off the advertisement", () => {
    expect(resolveMarket("Brasil", "pt")).toMatchObject({ country: "Brasil", currency: "BRL", corrected: false });
    expect(resolveMarket("Reino Unido", "en")).toMatchObject({ country: "Reino Unido", currency: "GBP" });
  });

  it("reads the country however the model happened to spell it", () => {
    for (const written of ["Estados Unidos", "EUA", "United States", "  usa  ", "US"]) {
      expect(resolveMarket(written, "en")?.country).toBe("Estados Unidos");
    }
    expect(resolveMarket("España", "es")?.country).toBe("Espanha");
    expect(resolveMarket("Espanha", "es")?.country).toBe("Espanha");
  });

  it("refuses Brazil for a posting written in English", () => {
    // The measured failure: an English advertisement came back priced in
    // reais. No Brazilian advertisement is written in English, so this is not
    // a close call — it is a market the posting itself rules out.
    const market = resolveMarket("Brasil", "en");
    expect(market?.country).toBe("Estados Unidos");
    expect(market?.corrected).toBe(true);
    expect(market?.origin).toBe("ruled-out");
    // O país descartado fica registrado: sem ele a tela corrige sem dizer o quê.
    expect(market?.requested).toBe("Brasil");
  });

  it("refuses Brazil for a posting written in Spanish", () => {
    expect(resolveMarket("Brasil", "es")?.country).toBe("Espanha");
  });

  it("keeps a market whose postings are genuinely written in English", () => {
    // Advertising in English is the norm in these markets, so the language
    // rules nothing out.
    for (const country of ["Alemanha", "Países Baixos", "Polônia", "Portugal", "México"]) {
      expect(resolveMarket(country, "en")?.corrected).toBe(false);
      expect(resolveMarket(country, "en")?.requested).toBeNull();
    }
  });

  it("does not turn Canada into the United States", () => {
    // A senior developer costs 25 to 30% less there, and the sites that
    // publish it are the Canadian ones.
    const canada = resolveMarket("Canadá", "en")!;
    expect(canada.currency).toBe("CAD");
    expect(canada.employers).toContain("glassdoor.ca");
    expect(canada.employers).not.toContain("glassdoor.com");
  });

  it("mantém um país de verdade que não está na lista", () => {
    // Japão é um país, não uma não-resposta. Trocá-lo pelo padrão do idioma
    // precificaria uma vaga japonesa no mercado americano; sem lista, a busca
    // vai para a web aberta, que é pior e não é errado.
    expect(resolveMarket("Japão", "en")).toBeNull();
    expect(resolveMarket("Índia", "en")).toBeNull();
  });

  it("cai no padrão do idioma quando o anúncio não declara país", () => {
    // Toda vaga é de algum lugar, porque quem contrata está em algum lugar —
    // mas o anúncio nem sempre diz qual, e "remoto" diz onde se trabalha, não
    // quem paga.
    for (const nonAnswer of ["não informado", "Remoto", "remote", "Europa", "global", "", "  ", "n/a"]) {
      expect(resolveMarket(nonAnswer, "pt")?.country).toBe("Brasil");
      expect(resolveMarket(nonAnswer, "en")?.country).toBe("Estados Unidos");
      expect(resolveMarket(nonAnswer, "es")?.country).toBe("Espanha");
    }
  });

  it("marca o padrão como padrão, e não como leitura", () => {
    const unstated = resolveMarket("Remoto", "en")!;
    expect(unstated.origin).toBe("unstated");
    expect(unstated.requested).toBeNull();

    const ruledOut = resolveMarket("Brasil", "en")!;
    expect(ruledOut.origin).toBe("ruled-out");
    expect(ruledOut.requested).toBe("Brasil");

    expect(resolveMarket("Reino Unido", "en")!.origin).toBe("read");
  });
});

describe("the search tool, aimed at one market", () => {
  it("restricts retrieval to that market's sources and locates it there", () => {
    const tool: any = searchToolFor(resolveMarket("Brasil", "pt"));
    expect(tool.filters.allowed_domains).toContain("glassdoor.com.br");
    expect(tool.filters.allowed_domains).toContain("michaelpage.com.br");
    expect(tool.user_location).toMatchObject({ country: "BR", timezone: "America/Sao_Paulo" });
  });

  it("does not answer a Brazilian job with American sources", () => {
    const tool: any = searchToolFor(resolveMarket("Brasil", "pt"));
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

describe("as chaves e os nomes, que não são a mesma coisa", () => {
  it("usa chave normalizada: minúscula e sem acento", () => {
    // A chave é o que `normalise` produz, e é por ela que DEFAULT_MARKET faz
    // acesso direto. Uma chave acentuada funcionaria pelo caminho do alias e
    // devolveria undefined no acesso direto, em silêncio.
    for (const key of KNOWN_MARKETS) {
      expect(key).toBe(key.toLowerCase());
      expect(key.normalize("NFD")).toBe(key);
    }
  });

  it("guarda o nome escrito de verdade para o que sai em texto", () => {
    // O termo de busca e o prompt levam este nome; "polonia" e "mexico" ali
    // se leem como erro de digitação.
    expect(resolveMarket("poland", "en")?.country).toBe("Polônia");
    expect(resolveMarket("mexico", "es")?.country).toBe("México");
    expect(resolveMarket("netherlands", "en")?.country).toBe("Países Baixos");
    expect(resolveMarket("canada", "en")?.country).toBe("Canadá");
  });

  it("aponta cada idioma para um mercado que existe", () => {
    // DEFAULT_MARKET é o único acesso direto por chave no módulo. Se uma
    // delas não existisse, o resolvedor devolveria campos vazios sem erro.
    const defaults = { pt: "Brasil", en: "Estados Unidos", es: "Espanha" } as const;
    for (const [language, country] of Object.entries(defaults)) {
      const fallback = resolveMarket("não informado", language as "pt" | "en" | "es")!;
      expect(fallback.country).toBe(country);
      expect(fallback.currency).toBeTruthy();
      expect(fallback.guides.length).toBeGreaterThan(0);
    }
    expect(resolveMarket("Estados Unidos", "pt")?.country).toBe("Brasil");
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
