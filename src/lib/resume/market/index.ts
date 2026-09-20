/**
 * What the job pays, looked up rather than remembered.
 *
 * A model asked from memory answers with the market it was trained on, which
 * is a year or more stale and never says so. This asks it to search, to copy
 * what each page publishes, and to cite it — so the figure can be checked
 * instead of trusted. What the pages add up to is decided in `band.ts`, which
 * is arithmetic, not judgement.
 *
 * It is a call of its own, and deliberately so. Folding the search into the
 * tailoring request would put the résumé in the context of a search and the
 * search results in the context of the résumé: the first is paid for on every
 * page of results, and the second breaks the cached prefix that makes the
 * tailoring call cheap. Separate, each one carries only what it needs.
 *
 * This file is the call and nothing else: the prose is in `prompt.ts`, the
 * answer's shape in `schema.ts`, the arithmetic in `band.ts`, the week-long
 * memo in `cache.ts`, and what the rest of the app reads in `types.ts`.
 */
import { OpenAiError, type ClientOptions } from "../client";
import { bandOf, companyBandOf } from "./band";
import { cached, remember } from "./cache";
import { INSTRUCTIONS } from "./prompt";
import { SCHEMA } from "./schema";
import { resolveMarket, searchToolFor, type ResolvedMarket } from "./sources";
import type { MarketObservation, MarketQuery, MarketSalary } from "./types";

export type { MarketObservation, MarketQuery, MarketSalary } from "./types";
export { bandOf, companyBandOf } from "./band";

const ENDPOINT = "https://api.openai.com/v1/responses";

/** A model that carries the tool. See `client.ts` on why this is pinned. */
export const SEARCH_MODEL = "gpt-5.6-luna";

/**
 * Billed per search, on top of the tokens — and the pages a search retrieves
 * are themselves billed as input at the model's rate. Two searches cost
 * several times everything else in the request put together, which is why the
 * instructions cap them and spend the budget on reading instead.
 */
export const SEARCH_CALL_USD = 0.01;

/**
 * How many searches one lookup should make: one for the market, one for the
 * employer. It cannot be enforced on the request — the API has no such
 * parameter — so it is enforced by writing both searches out in the message
 * and leaving the model nothing to improvise. See `inputFor`.
 */
export const MAX_SEARCHES = 2;

/**
 * Whether the posting named an employer worth searching for.
 *
 * The tailoring call is told to answer "não informado" when it did not, and
 * that string must not become a search: `"não informado" salário` returns
 * nothing about anybody.
 */
const named = (company: string) =>
  company.trim().length > 0 && !/^não informad/i.test(company.trim());

/**
 * The request, with the searches written out rather than left to be improvised.
 *
 * Handing the model a brief and letting it decide what to type into a search
 * engine made every run a different study: the terms moved, so the pages
 * moved, so the band moved. The terms are built here from the role, the level
 * and the country — three words the plan states discretely — so two runs of
 * one posting ask the same two questions, and the second one is about this
 * employer whenever there is an employer to ask about.
 */
/**
 * How the candidate's match is put to the salary model: as one of three words.
 *
 * It arrives as a score from 0 to 100, written by the cheapest model in the
 * pipeline, and a measured pair of runs on one posting returned 75 and then 0
 * — which dropped the recommended ask from 11.500 to the floor of the band.
 * That is the documented failure mode of fine-grained LLM scoring: studies of
 * numeric judging put close to half the variance down to generation noise
 * rather than to anything about what is being judged, and advise against
 * letting such a score drive a decision on its own.
 *
 * A coarse label survives that noise where two digits do not: 75 and 62 are
 * the same answer, and the difference between them was never real. The exact
 * number is still shown on the panel, where a human reads it as the estimate
 * it is.
 */
function matchLabel(fit: number): string {
  if (!Number.isFinite(fit) || fit <= 0 || fit >= 100) return "não avaliado com confiança";
  if (fit < 45) return "atende em parte";
  if (fit < 75) return "atende bem";
  return "atende com folga";
}

function inputFor(query: MarketQuery, market: ResolvedMarket | null): string {
  const year = new Date().getFullYear();
  const withCompany = named(query.company);
  // The market the code settled on, which may not be the one the plan named:
  // a posting in English is not a Brazilian job however the brief reads.
  const country = market?.country ?? query.country;

  const searches = [`salário ${query.role} ${query.actualLevel} ${country} ${year}`];
  if (withCompany) searches.push(`${query.company} salário ${query.role}`);

  return [
    `Cargo: ${query.role}`,
    `Nível das atribuições: ${query.actualLevel}`,
    `País: ${country}${market ? ` (mercado em ${market.currency})` : ""}`,
    `Empresa: ${query.company}`,
    "",
    "Buscas a fazer, nestes termos exatos e em nenhum outro:",
    ...searches.map((terms, index) => `${index + 1}. ${terms}`),
    withCompany
      ? "A segunda é obrigatória: é o que esta empresa paga, e responde por 40% da faixa final."
      : "O anúncio não nomeia empresa, então há uma busca só. Não invente uma segunda.",
    ...(market
      ? [
          "",
          // Named apart because they answer different questions, and because a
          // run that opened three pages of one site produced three votes from
          // one methodology.
          `A faixa sai dos guias com metodologia: ${market.guides.join(", ")}.`,
          `O que a empresa paga sai dos sites de vaga e avaliação: ${market.employers.join(", ")}.`,
          "Abra pelo menos um guia. Só conta a primeira página de cada site: abrir " +
            "três páginas do mesmo lugar não são três fontes."
        ]
      : []),
    "",
    `A vaga:\n${query.summary.trim()}`,
    "",
    `O candidato ${matchLabel(query.fit)} do que a vaga pede.`,
    `O que sustenta e o que falta: ${query.fitNote}`
  ].join("\n");
}

export async function searchMarketSalary(
  query: MarketQuery,
  options: ClientOptions
): Promise<MarketSalary> {
  const hit = cached(query);
  if (hit) return hit;

  const call = options.fetch ?? globalThis.fetch;
  const market = resolveMarket(query.country, query.language);

  const response = await call(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model ?? SEARCH_MODEL,
      instructions: INSTRUCTIONS,
      input: inputFor(query, market),
      /*
       * Billing decides the shape of this call. A search is $0.01 per call, and
       * the pages it retrieves are billed as input tokens at the model's rate —
       * so two searches cost about four times what every token in the request
       * and the answer costs together. That is why the instructions cap the
       * searches at two and spend the budget on reading, and why asking for the
       * per-source numbers in the answer is effectively free: output is the
       * cheapest part of this request, and it is the part that made the figure
       * stop moving.
       */
      /*
       * Aimed at one market rather than at the web. There is no parameter that
       * caps how many searches a lookup makes — the documentation says so, and
       * three measured runs confirmed it by searching three times each while
       * being told twice not to. So the fee is controlled by giving the model
       * exactly the searches to run, and the variance by deciding which pages
       * those searches can reach. See `sources.ts`.
       */
      tools: [searchToolFor(market)],
      /*
       * Without this, the pages a search actually consulted are not in the
       * response at all: only the ones the model chose to cite come back, as
       * annotations on the text. This code has always read `action.sources`
       * and, until now, always found it empty — the list has to be asked for.
       * It is what lets the panel show every page the band was read off,
       * rather than the subset the prose happened to mention.
       */
      include: ["web_search_call.action.sources"],
      text: { format: { type: "json_schema", name: "market_salary", strict: true, schema: SCHEMA } },
      // Copying figures off a page and reconciling three of them is more work
      // than "low" does well, and the thinking bills against output, which is
      // a rounding error next to the search fee.
      reasoning: { effort: "medium" },
      // Room for the observations: eight sources of figures, plus the prose.
      max_output_tokens: 4000,
      // The instructions are identical on every lookup, so they bill at a tenth
      // once the prefix is cached. Small money, but it is the same money the
      // tailoring call already saves this way.
      prompt_cache_key: "resume-salary-v1",
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

  const answered = parseMarketResponse(await response.json());
  const found: MarketSalary = {
    ...answered,
    /*
     * Sempre preenchido, inclusive quando não há lista: dizer "sem lista" sem
     * dizer de que país é esconder metade da informação, e o país é a escolha
     * que mais move o número.
     */
    searchedIn: market
      ? {
          country: market.country,
          currency: market.currency,
          listed: true,
          origin: market.origin,
          requested: market.requested
        }
      : {
          // País de verdade sem lista de fontes: mantido como veio, com a
          // moeda que a busca encontrou, porque trocá-lo pelo padrão do
          // idioma precificaria uma vaga japonesa no mercado americano.
          country: query.country,
          currency: answered.currency,
          listed: false,
          origin: "read" as const,
          requested: null
        }
  };

  remember(query, found);

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

  /*
   * The band the sources add up to, in place of the one the model wrote. The
   * model's own three survive only as the fallback inside `bandOf`, for the
   * lookup that came back with fewer than two comparable pages.
   */
  const observations = Array.isArray(found.observations) ? found.observations : [];
  const band = bandOf(observations, found);
  const companyBand = companyBandOf(observations, found);

  // The ask stays a judgement — a formula cannot know whether a band is narrow
  // or an employer pays above it — but it is a judgement about this band, so it
  // cannot land outside the one now being printed beside it.
  const ask = Number.isFinite(found.ask)
    ? Math.min(Math.max(found.ask, band.min), band.max)
    : band.median;

  const usage = payload?.usage ?? {};
  return {
    ...found,
    min: band.min,
    median: band.median,
    max: band.max,
    ask,
    observations,
    companyBand,
    // Preenchido por quem resolveu o mercado; aqui só existe a resposta.
    searchedIn: null,
    sources: [...sources.values()].slice(0, 6),
    usage: {
      inputTokens: usage.input_tokens ?? 0,
      cachedTokens: usage.input_tokens_details?.cached_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      searches: output.filter((item: any) => typeof item?.type === "string" && item.type.includes("search")).length
    }
  };
}
