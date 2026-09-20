import { describe, expect, it, vi } from "vitest";
import { OpenAiError } from "../client";
import { parseMarketResponse, searchMarketSalary, SEARCH_MODEL } from "./index";
import type { MarketObservation, MarketQuery } from "./types";

/** What the model answers with, before anything here has touched it. */
function answer(overrides: Record<string, unknown> = {}) {
  return {
    min: 9_000,
    median: 9_500,
    max: 10_000,
    currency: "BRL",
    period: "month",
    source: "search",
    note: "três guias salariais de 2026",
    ask: 9_400,
    askNote: "em torno da mediana",
    postingRegime: "não informado",
    bandRegime: "CLT",
    pjOverClt: 1.3,
    regimeNote: "cobre 13º, férias e FGTS",
    observations: [],
    ...overrides
  };
}

let publisher = 0;

function observation(overrides: Partial<MarketObservation> = {}): MarketObservation {
  return {
    title: "Guia salarial",
    // A publisher of its own unless a test says otherwise: the band counts one
    // reading per publisher, so sharing a URL would silently merge two sources.
    url: `https://guia-${(publisher += 1)}.com.br/salarios`,
    scope: "market",
    role: "Desenvolvedor Backend",
    level: "sênior",
    min: 12_000,
    median: 15_000,
    max: 18_000,
    currency: "BRL",
    period: "month",
    regime: "CLT",
    asOf: "2026",
    ...overrides
  };
}

/** A recorded response, in the shape the Responses API returns one. */
function payload(found: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  return {
    output: [
      { type: "web_search_call", action: { sources: [] } },
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(found), annotations: [] }]
      }
    ],
    usage: { input_tokens: 20_000, input_tokens_details: { cached_tokens: 800 }, output_tokens: 900 },
    ...extra
  };
}

describe("reading the salary lookup's answer", () => {
  it("prints the band the sources add up to, not the one the model wrote", () => {
    const found = parseMarketResponse(
      payload(
        answer({
          observations: [
            observation({ min: 10_000, median: 13_000, max: 16_000 }),
            observation({ min: 12_000, median: 15_000, max: 18_000 }),
            observation({ min: 14_000, median: 17_000, max: 20_000 })
          ]
        })
      )
    );
    expect(found).toMatchObject({ min: 12_000, median: 15_000, max: 18_000 });
    expect(found.observations).toHaveLength(3);
  });

  it("keeps the model's own reading when the sources do not add up to a band", () => {
    const found = parseMarketResponse(payload(answer({ observations: [observation()] })));
    expect(found).toMatchObject({ min: 9_000, median: 9_500, max: 10_000 });
  });

  it("reports what the named employer pays beside the band", () => {
    const found = parseMarketResponse(
      payload(
        answer({
          observations: [
            observation(),
            observation({ scope: "company", min: 11_000, median: 12_000, max: 13_000 })
          ]
        })
      )
    );
    expect(found.companyBand).toMatchObject({ min: 11_000, median: 12_000, max: 13_000, used: 1 });
  });

  it("has no employer band when nothing about the employer was found", () => {
    const found = parseMarketResponse(
      payload(answer({ observations: [observation(), observation()] }))
    );
    expect(found.companyBand).toBeNull();
  });

  it("pulls an ask that landed outside the band back into it", () => {
    const sources = [
      observation({ min: 12_000, median: 15_000, max: 18_000 }),
      observation({ min: 12_000, median: 15_000, max: 18_000 })
    ];
    expect(parseMarketResponse(payload(answer({ ask: 40_000, observations: sources }))).ask).toBe(18_000);
    expect(parseMarketResponse(payload(answer({ ask: 3_000, observations: sources }))).ask).toBe(12_000);
  });

  it("collects the pages consulted from the citations and from the search itself", () => {
    const recorded = payload(answer());
    recorded.output = [
      {
        type: "web_search_call",
        action: { sources: [{ title: "Glassdoor", url: "https://glassdoor.com.br/a" }] }
      },
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: JSON.stringify(answer()),
            annotations: [
              { type: "url_citation", title: "Guia", url: "https://exemplo.com/guia" },
              // The same page cited twice is one source, not two.
              { type: "url_citation", title: "Guia", url: "https://exemplo.com/guia" }
            ]
          }
        ]
      }
    ] as any;

    const found = parseMarketResponse(recorded);
    expect(found.sources).toHaveLength(2);
    expect(found.sources.map((item) => item.url)).toContain("https://glassdoor.com.br/a");
  });

  it("counts the searches, which are what the lookup is billed for", () => {
    const found = parseMarketResponse(payload(answer()));
    expect(found.usage.searches).toBe(1);
    expect(found.usage).toMatchObject({ inputTokens: 20_000, cachedTokens: 800, outputTokens: 900 });
  });

  it("refuses an answer that is not the JSON that was asked for", () => {
    const broken: any = payload(answer());
    broken.output[1].content[0].text = "desculpe, não encontrei";
    expect(() => parseMarketResponse(broken)).toThrow(OpenAiError);
  });

  it("refuses an answer with no text at all", () => {
    expect(() => parseMarketResponse({ output: [] })).toThrow(OpenAiError);
  });
});

describe("the request the lookup sends", () => {
  const query = (overrides: Partial<MarketQuery> = {}): MarketQuery => ({
    summary: "Backend sênior em Go, logística, Brasil, remoto",
    role: "Desenvolvedor Backend Sênior",
    country: "Brasil",
    language: "pt",
    actualLevel: "sênior",
    company: "Frete.com",
    fit: 70,
    fitNote: "Go e microsserviços em produção",
    cacheKey: `posting-${Math.random()}`,
    ...overrides
  });

  const ok = (found = answer()) =>
    vi.fn(async () => new Response(JSON.stringify(payload(found)), { status: 200 }));

  it("asks for two things the band depends on: the pages, and room to quote them", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any });

    const body = JSON.parse((fetchImpl.mock.calls[0] as any)[1].body);
    expect(body.model).toBe(SEARCH_MODEL);
    expect(body.tools[0]).toMatchObject({ type: "web_search", search_context_size: "medium" });
    // Retrieval is restricted to named salary sources and aimed at the market
    // that pays the job: the one change that cuts variance without buying
    // another search.
    expect(body.tools[0].filters.allowed_domains).toContain("glassdoor.com.br");
    expect(body.tools[0].user_location).toMatchObject({ country: "BR" });
    // Copying figures off a page is more work than "low" does well, and the
    // observations need somewhere to fit.
    expect(body.reasoning).toEqual({ effort: "medium" });
    // There is no parameter that caps searches; sending one that the API
    // ignores reads like a guarantee this code does not have.
    expect(body).not.toHaveProperty("max_tool_calls");
    // The pages consulted are not returned unless they are asked for, and a
    // band nobody can trace back to a page is a guess with extra steps.
    expect(body.include).toContain("web_search_call.action.sources");
    expect(body.max_output_tokens).toBeGreaterThanOrEqual(4000);
    expect(body.text.format.strict).toBe(true);
    // The résumé is not in this request, and the posting is not either: only
    // the brief. Nothing here should outlive the answer.
    expect(body.store).toBe(false);
    expect(body.input).toContain("Frete.com");
  });

  it("writes the searches out, so two runs of one posting ask the same thing", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any });

    const { input } = JSON.parse((fetchImpl.mock.calls[0] as any)[1].body);
    const year = new Date().getFullYear();
    expect(input).toContain(`1. salário Desenvolvedor Backend Sênior sênior Brasil ${year}`);
    expect(input).toContain("2. Frete.com salário Desenvolvedor Backend Sênior");
    // The employer's own figures are the ones that weigh double; a run that
    // skips this search is a run with nothing to weigh.
    expect(input).toContain("obrigatória");
  });

  it("asks the same two questions whatever prose the brief came back with", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query({ summary: "Vaga sênior de backend, Go, remoto" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });
    await searchMarketSalary(query({ summary: "Backend Go sênior numa fintech, home office" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });

    const searchesIn = (call: number) =>
      JSON.parse((fetchImpl.mock.calls[call] as any)[1].body)
        .input.split("\n")
        .filter((line: string) => /^\d\. /.test(line));

    expect(searchesIn(0)).toEqual(searchesIn(1));
  });

  it("names which sites answer which question", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any });

    const { input } = JSON.parse((fetchImpl.mock.calls[0] as any)[1].body);
    // Crowdsourced figures supplement a structured guide rather than replace
    // it, so the band and the employer are asked of different halves of the list.
    expect(input).toContain("michaelpage.com.br");
    expect(input).toContain("glassdoor.com.br");
    expect(input).toContain("Abra pelo menos um guia");
  });

  it("puts the match in words, because the score behind it is noise at two digits", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query({ fit: 75 }), { apiKey: "k", fetch: fetchImpl as any });
    await searchMarketSalary(query({ fit: 0 }), { apiKey: "k", fetch: fetchImpl as any });

    const inputOf = (call: number) => JSON.parse((fetchImpl.mock.calls[call] as any)[1].body).input;
    expect(inputOf(0)).toContain("atende com folga");
    expect(inputOf(0)).not.toContain("75%");
    // The measured failure: the same posting scored 75 and then 0, and a 0
    // pinned the recommendation to the floor of the band.
    expect(inputOf(1)).toContain("não avaliado com confiança");
  });

  it("searches once, and for nothing made up, when the posting names no employer", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query({ company: "não informado" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });

    const { input } = JSON.parse((fetchImpl.mock.calls[0] as any)[1].body);
    expect(input).not.toContain("2. ");
    expect(input).toContain("Não invente uma segunda.");
  });

  it("diz em que mercado pesquisou, que é a escolha que mais move o número", async () => {
    const fetchImpl = ok();
    const found = await searchMarketSalary(query({ country: "Reino Unido", language: "en" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });

    expect(found.searchedIn).toEqual({
      country: "Reino Unido",
      currency: "GBP",
      listed: true,
      origin: "read",
      requested: null
    });
  });

  it("marca quando o idioma do anúncio derrubou o país que a leitura apontou", async () => {
    const fetchImpl = ok();
    // A falha medida: um anúncio em inglês voltou precificado em reais.
    const found = await searchMarketSalary(query({ country: "Brasil", language: "en" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });

    // Não basta dizer que corrigiu: a tela mostra o que foi descartado, para
    // que a correção possa ser julgada por quem lê.
    expect(found.searchedIn).toMatchObject({
      country: "Estados Unidos",
      origin: "ruled-out",
      requested: "Brasil"
    });
  });

  it("assume a web aberta para um país sem lista, e diz isso", async () => {
    const fetchImpl = ok();
    const found = await searchMarketSalary(query({ country: "Japão", language: "en" }), {
      apiKey: "k",
      fetch: fetchImpl as any
    });

    // Continua dizendo de que país se trata: "sem lista" sozinho esconde
    // metade da informação.
    expect(found.searchedIn).toMatchObject({ country: "Japão", listed: false });
    const body = JSON.parse((fetchImpl.mock.calls[0] as any)[1].body);
    expect(body.tools[0].filters).toBeUndefined();
  });

  it("pays for the same posting once", async () => {
    const fetchImpl = ok();
    const asked = query();

    const first = await searchMarketSalary(asked, { apiKey: "k", fetch: fetchImpl as any });
    const second = await searchMarketSalary(asked, { apiKey: "k", fetch: fetchImpl as any });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(second.median).toBe(first.median);
    // The second generation did not pay for the search, and must not be
    // reported as if it had.
    expect(second.usage).toMatchObject({ inputTokens: 0, outputTokens: 0, searches: 0 });
  });

  it("looks the band up again for a different posting", async () => {
    const fetchImpl = ok();
    await searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any });
    await searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("reports an upstream failure as one, rather than as a band of zero", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 500 }));
    await expect(
      searchMarketSalary(query(), { apiKey: "k", fetch: fetchImpl as any })
    ).rejects.toBeInstanceOf(OpenAiError);
  });
});
