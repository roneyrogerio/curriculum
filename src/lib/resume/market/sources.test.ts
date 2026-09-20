import { describe, expect, it } from "vitest";
import { KNOWN_MARKETS, marketsByKey, resolveMarket, searchToolFor } from "./sources";
import { CURRENCIES } from "./types";

describe("o mercado que o país nomeado aponta", () => {
  /*
   * Quem decide o país é o modelo, que leu o anúncio inteiro. Houve uma
   * versão em que este módulo conferia a resposta dele contra o idioma do
   * texto e a descartava quando discordavam — e uma vaga brasileira com
   * "estamos" e "buscamos" no corpo bastava para ser chamada de espanhola.
   * O que se testa aqui é a tradução de um nome de país em mercado, que é
   * tudo o que sobrou de responsabilidade do código.
   */
  it("traduz o país em moeda, fuso e fontes", () => {
    expect(resolveMarket("Brasil")).toMatchObject({ country: "Brasil", currency: "BRL" });
    expect(resolveMarket("Reino Unido")).toMatchObject({ country: "Reino Unido", currency: "GBP" });
  });

  it("lê o país como o modelo houver escrito", () => {
    for (const written of ["Estados Unidos", "EUA", "United States", "  usa  ", "US"]) {
      expect(resolveMarket(written)?.country).toBe("Estados Unidos");
    }
    expect(resolveMarket("España")?.country).toBe("Espanha");
    expect(resolveMarket("Espanha")?.country).toBe("Espanha");
    expect(resolveMarket("poland")?.country).toBe("Polônia");
  });

  it("não transforma o Canadá nos Estados Unidos", () => {
    // Um sênior custa 25 a 30% menos lá, e quem publica isso são os sites .ca.
    const canada = resolveMarket("Canadá")!;
    expect(canada.currency).toBe("CAD");
    expect(canada.employers).toContain("glassdoor.ca");
    expect(canada.employers).not.toContain("glassdoor.com");
  });

  it("devolve nada para um país sem lista de fontes própria", () => {
    // A busca cai na web aberta: pior que uma lista, melhor que o mercado
    // errado. Trocar Japão por um padrão precificaria a vaga em outro país.
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

describe("as chaves e os nomes, que não são a mesma coisa", () => {
  it("usa chave normalizada: minúscula e sem acento", () => {
    // A chave é o que `normalise` produz. Uma chave acentuada funcionaria
    // pelo caminho do alias e quebraria em qualquer acesso direto.
    for (const key of KNOWN_MARKETS) {
      expect(key).toBe(key.toLowerCase());
      expect(key.normalize("NFD")).toBe(key);
    }
  });

  it("guarda o nome escrito de verdade para o que sai em texto", () => {
    // O termo de busca e o prompt levam este nome; "polonia" e "mexico" ali
    // se leem como erro de digitação.
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
