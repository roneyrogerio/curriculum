/**
 * What the job pays, looked up rather than remembered.
 *
 * A model asked from memory answers with the market it was trained on, which
 * is a year or more stale and never says so. This asks it to search, and to
 * cite what it found — so the figure can be checked instead of trusted.
 *
 * It is a call of its own, and deliberately so. Folding the search into the
 * tailoring request would put the résumé in the context of a search and the
 * search results in the context of the résumé: the first is paid for on every
 * page of results, and the second breaks the cached prefix that makes the
 * tailoring call cheap. Separate, each one carries only what it needs.
 */
import { createHash } from "node:crypto";
import { OpenAiError, type ClientOptions } from "./client";

const ENDPOINT = "https://api.openai.com/v1/responses";

/** A model that carries the tool. See `client.ts` on why this is pinned. */
export const SEARCH_MODEL = "gpt-5.6-luna";

/**
 * Billed per search, on top of the tokens. It dominates the cost of this call,
 * which is why the search happens once and not per section of the résumé.
 */
export const SEARCH_CALL_USD = 0.01;

export interface MarketSalary {
  min: number;
  /**
   * The middle of the market, which is what the ask should be read against.
   *
   * Without it the panel showed only a floor and a ceiling, and every figure
   * above the middle looked like it was pinned to the top — a band of 15k to
   * 18k with an ask of 17k reads as "almost the maximum" and as "the median
   * plus five hundred", and only one of those is true.
   */
  median: number;
  max: number;
  currency: "BRL" | "USD" | "EUR";
  period: "month" | "year";
  /** Whether the posting stated it, or it was found by searching. */
  source: "posting" | "search";
  /**
   * The contract the posting asks for, when it says.
   *
   * In Brazil this changes what a number means. A CLT salary carries the 13th,
   * a third of a month of holiday, FGTS and the employer's share; a PJ invoice
   * carries none of it, and is quoted higher for the same work. Comparing the
   * two gross figures without saying which is which is comparing nothing.
   */
  postingRegime: "CLT" | "PJ" | "não informado" | "não se aplica";
  /** Which of the two the figures above are quoted in. Salary guides publish
   *  CLT, so a band read from one is CLT unless the source says otherwise. */
  bandRegime: "CLT" | "PJ" | "não se aplica";
  /**
   * What the same work is worth as PJ, as a multiple of the CLT figure, in
   * this market and at this level. Returned rather than applied: the
   * conversion happens in the code, next to the factor that produced it.
   */
  pjOverClt: number;
  /** One line on what that multiple accounts for. */
  regimeNote: string;
  /** One line on what the figure rests on. */
  note: string;
  /**
   * What to ask for, decided here rather than computed.
   *
   * It was arithmetic once — the match score read as a position inside the
   * band — and it was wrong in a way that only showed on narrow bands: a 76%
   * match on a band of 15k to 18k came out at 17.28k, which is 720 short of
   * the ceiling. A formula cannot know whether a band is narrow or wide, in
   * demand or stagnant, or whether that employer pays above it. Whoever just
   * read the sources can.
   */
  ask: number;
  /** One line on why that figure, in negotiating terms. */
  askNote: string;
  /** Every page consulted, so the number can be checked. */
  sources: { title: string; url: string }[];
  usage: { inputTokens: number; cachedTokens: number; outputTokens: number; searches: number };
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "min",
    "median",
    "max",
    "currency",
    "period",
    "source",
    "note",
    "ask",
    "askNote",
    "postingRegime",
    "bandRegime",
    "pjOverClt",
    "regimeNote"
  ],
  properties: {
    min: {
      type: "number",
      description:
        "Piso bruto da faixa. Guias salariais publicam percentis: este costuma " +
        "ser o 25º, ou seja, três quartos do mercado ganham acima dele."
    },
    median: {
      type: "number",
      description:
        "O meio do mercado — a mediana, ou o 50º percentil. É contra ela que o " +
        "valor a pedir deve ser lido, não contra o teto."
    },
    max: { type: "number", description: "Teto bruto da faixa encontrada." },
    currency: { type: "string", enum: ["BRL", "USD", "EUR"] },
    period: {
      type: "string",
      enum: ["month", "year"],
      description: "A convenção do mercado da vaga: mensal no Brasil, anual nos EUA."
    },
    source: {
      type: "string",
      enum: ["posting", "search"],
      description: "'posting' só se o próprio anúncio declarar a faixa."
    },
    note: {
      type: "string",
      description:
        "Uma linha: de onde veio o número. Se foi busca, diga o que as fontes " +
        "mostram e de quando são. Se achou dados da própria empresa, diga isso " +
        "primeiro — a faixa de uma empresa vale mais que a média do país."
    },
    ask: {
      type: "number",
      description:
        "Quanto esta pessoa deve pedir, na mesma moeda e período. Você acabou de " +
        "ler as fontes: use o que elas mostram, e não uma fração da faixa. O topo " +
        "é para quem excede todos os requisitos; um encaixe bom mas com lacunas " +
        "pede acima do meio, não encostado no teto. Numa faixa estreita, alguns " +
        "por cento são a diferença entre negociar e ser descartado. Considere " +
        "também se a empresa paga acima ou abaixo do mercado, se isso apareceu."
    },
    postingRegime: {
      type: "string",
      enum: ["CLT", "PJ", "não informado", "não se aplica"],
      description:
        "O contrato que o anúncio pede, se disser. 'não informado' quando o " +
        "anúncio é brasileiro e não diz; 'não se aplica' fora do Brasil."
    },
    bandRegime: {
      type: "string",
      enum: ["CLT", "PJ", "não se aplica"],
      description:
        "Em qual regime a faixa acima está cotada. Guias salariais brasileiros " +
        "publicam CLT: se a sua fonte for um deles, é CLT. Diga PJ só se a " +
        "fonte for explicitamente de valores PJ."
    },
    pjOverClt: {
      type: "number",
      description:
        "Quanto o mesmo trabalho vale como PJ, em múltiplo do valor CLT, neste " +
        "mercado e neste nível — algo entre 1,2 e 1,4 no Brasil, conforme o que " +
        "as fontes mostrarem. É o que cobre 13º, férias com um terço, FGTS e a " +
        "parte patronal, que o PJ não recebe. Use 1 fora do Brasil."
    },
    regimeNote: {
      type: "string",
      description: "Uma linha sobre o que esse múltiplo cobre, e de onde veio."
    },
    askNote: {
      type: "string",
      description:
        "Uma linha, em termos de negociação: por que esse número, e o que no " +
        "perfil o sustenta ou o limita."
    }
  }
};

const INSTRUCTIONS = `Você descobre quanto um cargo paga hoje.

Recebe a descrição curta de uma vaga, já lida e resumida, com o nível que as
atribuições realmente são — não o rótulo do anúncio. Sua tarefa é uma só:
achar a faixa que esse nível paga.

**Pesquise na web.** Não responda de memória: a sua memória é de um mercado de
pelo menos um ano atrás e não avisa que está velha.

**Pesquise o mercado do país que a descrição indica**, e responda na moeda e na
convenção dele: real por mês no Brasil, dólar por ano nos Estados Unidos. O
erro caro aqui é devolver a faixa americana para uma vaga brasileira — ela sai
cinco vezes maior e não serve para nada. Se a descrição não disser o país, mas
estiver em português, é o Brasil.

Faça **duas buscas**: uma pelo mercado do cargo naquele país, e outra pelo nome
da empresa, se houver um — o que uma empresa específica paga vale mais que a
média nacional, e sai em sites de avaliação e de vagas. Se a empresa não for
informada, ou nada aparecer sobre ela, use só a do mercado e diga isso.

Prefira fontes com metodologia declarada e diga de quando são os dados.

Se a descrição já trouxer a faixa declarada pelo próprio anúncio, use aquela e
marque source como "posting" — um número declarado vale mais que um estimado.

Diga também **em que regime** o anúncio contrata — CLT ou PJ —, em qual regime
a faixa que você encontrou está cotada, e por quanto se multiplica um valor CLT
para chegar ao PJ equivalente neste mercado. No Brasil os dois brutos não se
comparam: o CLT carrega 13º, férias com um terço, FGTS e a parte patronal, e o
PJ não carrega nada disso — por isso é cotado mais alto pelo mesmo trabalho.
Fora do Brasil, isso não se aplica.

Depois diga **quanto esta pessoa deve pedir**. Não é uma fração da faixa: é um
número de negociação, e a referência é a **mediana**, não o teto.

A faixa é a distribuição de quem já faz o trabalho, não uma régua de
qualificação: o piso costuma ser o 25º percentil, com três quartos do mercado
acima dele. Por isso atender 70% ou 80% do que a vaga pede não significa pedir
perto do piso — significa um candidato normal e contratável, cujo lugar é em
torno da mediana. Pedir abaixo do piso ancora abaixo de três quartos do
mercado, e âncora baixa gruda.

Então: em torno da mediana para um encaixe comum, acima dela quando o que
sustenta é específico e demonstrado, e o teto só para quem excede os
requisitos. Explique o número em relação à mediana.`;

export interface MarketQuery {
  /** The short brief the tailoring call wrote, not the advertisement. */
  summary: string;
  actualLevel: string;
  /** The employer, when the posting named one. */
  company: string;
  /** How well the candidate matched, from 0 to 100, and why. */
  fit: number;
  fitNote: string;
  /**
   * What identifies this lookup for caching: the posting itself.
   *
   * Not the summary. The summary is rewritten by the model on every run, so
   * two generations of the same advertisement produced two different keys and
   * the cache never hit — measured, twice in a row, at full price. The
   * posting is the thing that is actually the same.
   */
  cacheKey: string;
}

/*
 * The same posting, looked up once.
 *
 * Regenerating a résumé while tweaking it is the normal way to use this page,
 * and the band does not move between two attempts five minutes apart — but the
 * search is billed per call and dominates the bill. So the answer is kept for
 * a week, which is far shorter than a salary guide's own update cycle.
 *
 * In memory, and therefore per pod and lost on deploy. That is the right size
 * for this: a miss costs a cent, so a store worth running and backing up would
 * cost more than it saves.
 */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX = 50;
const cache = new Map<string, { at: number; value: MarketSalary }>();

const keyOf = (query: MarketQuery) =>
  createHash("sha256").update(query.cacheKey).digest("hex");

export async function searchMarketSalary(
  query: MarketQuery,
  options: ClientOptions
): Promise<MarketSalary> {
  const key = keyOf(query);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    // Usage zeroed: this lookup was paid for once, and reporting it again
    // would make a cached generation look like it cost what the first did.
    return { ...hit.value, usage: { inputTokens: 0, cachedTokens: 0, outputTokens: 0, searches: 0 } };
  }

  const call = options.fetch ?? globalThis.fetch;

  const response = await call(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model ?? SEARCH_MODEL,
      instructions: INSTRUCTIONS,
      input:
        `Nível das atribuições: ${query.actualLevel}\n` +
        `Empresa: ${query.company}\n\n` +
        `A vaga:\n${query.summary.trim()}\n\n` +
        `O candidato atende ${query.fit}% do que a vaga pede.\n` +
        `O que sustenta e o que falta: ${query.fitNote}`,
      tools: [{ type: "web_search" }],
      text: { format: { type: "json_schema", name: "market_salary", strict: true, schema: SCHEMA } },
      reasoning: { effort: "low" },
      max_output_tokens: 2000,
      store: false
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    let message = `OpenAI returned ${response.status}`;
    try {
      const parsed = JSON.parse(detail);
      if (typeof parsed?.error?.message === "string") message = parsed.error.message;
    } catch {
      /* the body was not JSON; the status is all there is to report */
    }
    throw new OpenAiError(message, response.status);
  }

  const found = parseMarketResponse(await response.json());

  // Oldest out first: insertion order is what Map iterates, and a week-old
  // entry is the one least likely to be asked for again.
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value: found });

  return found;
}

/** Exported so a test can feed it a recorded response, with no key and no network. */
export function parseMarketResponse(payload: any): MarketSalary {
  const output = payload?.output ?? [];
  const parts = output
    .filter((item: any) => item?.type === "message")
    .flatMap((item: any) => item?.content ?? []);

  const text = parts.find((part: any) => part?.type === "output_text")?.text;
  if (typeof text !== "string") throw new OpenAiError("A busca não retornou texto.", 502);

  let found: Omit<MarketSalary, "sources" | "usage">;
  try {
    found = JSON.parse(text);
  } catch {
    throw new OpenAiError("A busca retornou algo que não é o JSON pedido.", 502);
  }

  /*
   * The pages consulted. Citations come attached to the text, and the search
   * item carries the full list; both are read, because a figure that cannot be
   * traced to a page is just a guess with extra steps.
   */
  const sources = new Map<string, { title: string; url: string }>();
  for (const part of parts) {
    for (const annotation of part?.annotations ?? []) {
      if (annotation?.type === "url_citation" && annotation.url) {
        sources.set(annotation.url, { title: annotation.title ?? annotation.url, url: annotation.url });
      }
    }
  }
  for (const item of output) {
    for (const source of item?.sources ?? item?.action?.sources ?? []) {
      const url = source?.url ?? source;
      if (typeof url === "string") sources.set(url, { title: source?.title ?? url, url });
    }
  }

  const usage = payload?.usage ?? {};
  return {
    ...found,
    sources: [...sources.values()].slice(0, 6),
    usage: {
      inputTokens: usage.input_tokens ?? 0,
      cachedTokens: usage.input_tokens_details?.cached_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      searches: output.filter((item: any) => typeof item?.type === "string" && item.type.includes("search")).length
    }
  };
}
