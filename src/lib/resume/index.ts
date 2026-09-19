/**
 * One posting in, one printable document out.
 *
 * The pipeline, and why it is in this order:
 *
 *   facts    the CV becomes id-addressed facts, so the model can only point
 *   prompt   the stable half first, the posting last, for the prompt cache
 *   client   Structured Outputs, so the answer parses or the request fails
 *   verify   every rewrite is checked against the fact it claims to rewrite
 *   compose  employer, dates and links are read from src/data, never the answer
 *
 * Nothing above the client knows about OpenAI, and nothing below the client
 * knows about HTTP. Swapping the provider is `client.ts`; swapping the renderer
 * is `document.ts`. That is the whole reason the seams are where they are.
 */
import type { CV, Locale } from "../../data/types";
import { cvByLocale } from "../../data";
import { detectLocale } from "../language";
import { complete, costOf, DEFAULT_MODEL, type ClientOptions, type Usage } from "./client";
import { composeDocument } from "./compose";
import type { ResumeDocument } from "./document";
import { factsOf } from "./facts";
import { factsPrompt, INSTRUCTIONS, postingPrompt } from "./prompt";
import { responseFormat } from "./schema";
import { searchMarketSalary, SEARCH_CALL_USD, SEARCH_MODEL, type MarketSalary } from "./market";
import { exchangeRates, type Rates } from "./rates";
import { verifyPlan, type Violation } from "./verify";

export interface TailorRequest {
  /** The posting, title included: the title is the first line of any posting. */
  posting: string;
  /** Forced locale. Left out, the posting's own language decides. */
  locale?: Locale;
  model?: string;
}

export interface SalaryAdvice {
  /** The brief the search was run with, shown so a wrong market is visible. */
  summary: string;
  /** The employer the search also looked for, when the posting named one. */
  company: string;
  /**
   * The band and what to ask, both from the search: whoever read the sources
   * decides the figure. It used to be computed here, as the match score read
   * as a position inside the band, and that was wrong on narrow bands — 76% of
   * a band from 15k to 18k lands 720 short of the ceiling, which is not what
   * a three-quarters match is worth.
   */
  market: MarketSalary;
  /** ECB reference rates, or null when the feed could not be reached. */
  rates: Rates | null;
  fit: number;
  fitNote: string;
  advertisedLevel: string;
  actualLevel: string;
}

export interface TailorResult {
  document: ResumeDocument;
  locale: Locale;
  /** The model's own account of what it led with and what it cut. */
  rationale: string;
  /**
   * What the job pays and what to ask for. Shown on the panel and never
   * printed: `composeDocument` does not read it, so it cannot reach the sheet.
   */
  salary: SalaryAdvice | null;
  /** Empty on a clean answer. Non-empty means a rewrite was rolled back. */
  violations: Violation[];
  usage: Usage & { model: string; usd: number };
}

/** Keeps a stray score outside 0..100 from placing the ask outside the band. */
const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/** Caps the posting before it reaches a token bill. Postings are not novels. */
export const MAX_POSTING = 20_000;

export class InputError extends Error {}

export async function tailorResume(
  request: TailorRequest,
  options: ClientOptions
): Promise<TailorResult> {
  const posting = request.posting.trim();
  if (posting.length < 40) {
    throw new InputError("The posting is too short to adapt anything to.");
  }
  if (posting.length > MAX_POSTING) {
    throw new InputError(`The posting is longer than ${MAX_POSTING} characters.`);
  }

  // A posting in English gets the English résumé, whichever page it was pasted
  // on: the document has to be readable by whoever wrote the advertisement.
  const locale: Locale = request.locale ?? detectLocale(posting);
  const cv: CV = cvByLocale[locale];
  const facts = factsOf(cv);

  const { plan, usage, model } = await complete(
    {
      instructions: INSTRUCTIONS,
      input: `${factsPrompt(cv, facts)}\n\n${postingPrompt(posting)}`,
      format: responseFormat(facts)
    },
    { ...options, model: request.model ?? options.model ?? DEFAULT_MODEL }
  );

  const verified = verifyPlan(cv, facts, plan);

  /*
   * The band is looked up with the short brief the model just wrote, not with
   * the advertisement: a search reads better from three lines of "senior Go
   * backend, fintech, Brazil, remote" than from two pages of culture and
   * benefits, and the tokens are a fraction of it.
   *
   * A failed search is not a failed adaptation. The résumé is the point; the
   * figure is advice beside it, so it is dropped and the panel simply shows
   * nothing rather than the whole generation being lost to it.
   */
  const assessment = verified.plan.posting;
  let salary: SalaryAdvice | null = null;
  let searchUsd = 0;
  try {
    const market = await searchMarketSalary(
      {
        summary: assessment.summary,
        actualLevel: assessment.actualLevel,
        company: assessment.company,
        fit: clamp(assessment.fit),
        fitNote: assessment.fitNote,
        // The advertisement, which is what is the same between two runs.
        cacheKey: `${locale}\u0000${posting}`
      },
      { ...options, model: SEARCH_MODEL }
    );
    searchUsd =
      costOf(market.usage, SEARCH_MODEL) + market.usage.searches * SEARCH_CALL_USD;
    salary = {
      summary: assessment.summary,
      company: assessment.company,
      market,
      rates: await exchangeRates(options.fetch),
      fit: clamp(assessment.fit),
      fitNote: assessment.fitNote,
      advertisedLevel: assessment.advertisedLevel,
      actualLevel: assessment.actualLevel
    };
  } catch (error) {
    console.error("market salary lookup failed", error);
  }

  return {
    document: composeDocument(cv, verified.plan),
    locale,
    rationale: verified.plan.rationale,
    salary,
    violations: verified.violations,
    // Both calls, and the search fee, in one figure: two requests are still
    // one generation from the perspective of whoever pays for it.
    usage: { ...usage, model, usd: costOf(usage, model) + searchUsd }
  };
}

export { documentOf } from "./compose";
export type { ResumeDocument, Block, Section } from "./document";
