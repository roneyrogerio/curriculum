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
import { complete, costOf, DEFAULT_MODEL, type ClientOptions, type Usage } from "./client";
import { composeDocument } from "./compose";
import type { ResumeDocument } from "./document";
import { factsOf } from "./facts";
import { factsPrompt, INSTRUCTIONS, panelPrompt, postingPrompt } from "./prompt";
import { responseFormat } from "./schema";
import { searchMarketSalary, SEARCH_CALL_USD, SEARCH_MODEL, type MarketSalary } from "./market";
import { titleForCandidate } from "./title";
import { triagePosting, TRIAGE_MODEL } from "./triage";
import { verifyPlan, type Violation } from "./verify";

export interface TailorModels {
  triage?: string;
  tailor?: string;
  salary?: string;
}

export interface TailorRequest {
  /** The posting, title included: the title is the first line of any posting. */
  posting: string;
  /** Forced locale. Left out, the posting's own language decides. */
  locale?: Locale;
  /**
   * Whether to look up what the job pays. On unless asked otherwise.
   *
   * It is the expensive half of a generation and the optional one: two web
   * searches, billed per call, against a résumé that is already written by
   * the time the lookup starts. Somebody adjusting a posting and regenerating
   * to see the sheet change should not buy the same salary band each time.
   */
  salary?: boolean;
  /**
   * The language of everything shown beside the résumé — the brief, the
   * levels, the market notes, the account of what was cut.
   *
   * It is the page the candidate is reading, and it is a separate question
   * from `locale`: the sheet is written for whoever wrote the advertisement,
   * and this is written for whoever is looking at the screen. Left out, the
   * résumé's own language is used, which is what happened before there was
   * anywhere else to take it from.
   */
  adviceLocale?: Locale;
  /** Model for tailoring the résumé. Backward-compatible alias for models.tailor. */
  model?: string;
  /** Stage-specific model overrides. */
  models?: TailorModels;
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
  /**
   * All three calls combined, not just the middle one.
   *
   * Tokens previously displayed were only for the tailoring step, alongside a
   * price that already summed all three — dividing one by the other yielded a
   * nonsensical figure, and the call that consumes the most input (the search,
   * which ingests entire pages) did not appear anywhere. Either both represent
   * the total, or neither does.
   */
  usage: Usage & { model: string; usd: number; searches: number };
}

/** Keeps a stray score outside 0..100 from placing the ask outside the band. */
const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/** Caps the posting before it reaches a token bill. Postings are not novels. */
export const MAX_POSTING = 20_000;

export class InputError extends Error {}

/**
 * Not an error: the one way out of the salary block that means "asked not to".
 *
 * The block already turns a failed lookup into a missing panel rather than a
 * failed generation, and that is the behaviour wanted here too — so this
 * leaves through the same door, and is told apart at the bottom so a
 * deliberate skip is never logged as a fault.
 */
class SkipSalary extends Error {}

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

  const triageModel = request.models?.triage ?? TRIAGE_MODEL;
  const tailorModel = request.models?.tailor ?? request.model ?? options.model ?? DEFAULT_MODEL;
  const salaryModel = request.models?.salary ?? SEARCH_MODEL;

  /*
   * First, where the job is and what language it speaks.
   *
   * Both answers have to exist before the other calls: the language chooses
   * which résumé goes into the prompt, and the country chooses which sources
   * the salary search may enter. Asking the tailoring call would arrive too
   * late for the first, and working them out in code was tried — by counting
   * the posting's words, with a Brazilian job coming out Spanish.
   *
   * A tenth of a cent, against three to five for the whole generation.
   */
  const triage = await triagePosting(posting, { ...options, model: triageModel });

  const locale: Locale = request.locale ?? triage.language;
  const cv: CV = cvByLocale[locale];
  const facts = factsOf(cv);

  const advice: CV = cvByLocale[request.adviceLocale ?? locale];

  const { plan, usage, model } = await complete(
    {
      instructions: INSTRUCTIONS,
      input: [
        factsPrompt(cv, facts),
        panelPrompt(advice.labels.languageLabel, cv.labels.languageLabel),
        postingPrompt(posting)
      ].join("\n\n"),
      format: responseFormat(facts)
    },
    { ...options, model: tailorModel }
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
  let searchUsage: Usage & { searches: number } = {
    inputTokens: 0,
    cachedTokens: 0,
    outputTokens: 0,
    searches: 0
  };
  const wantsSalary = request.salary ?? true;

  try {
    if (!wantsSalary) throw new SkipSalary();
    const market = await searchMarketSalary(
      {
        summary: assessment.summary,
        // The same title the sheet is headed with, so the search asks about
        // the job the résumé claims rather than about a rephrasing of it.
        role: titleForCandidate(verified.plan.targetRole) || cv.role,
        country: triage.country,
        actualLevel: assessment.actualLevel,
        company: triage.company,
        fit: clamp(assessment.fit),
        fitNote: assessment.fitNote,
        // The advertisement, which is what is the same between two runs.
        cacheKey: posting,
        language: advice.labels.languageLabel
      },
      { ...options, model: salaryModel }
    );
    searchUsd =
      costOf(market.usage, salaryModel) + market.usage.searches * SEARCH_CALL_USD;
    searchUsage = market.usage;
    salary = {
      summary: assessment.summary,
      company: triage.company,
      market,
      fit: clamp(assessment.fit),
      fitNote: assessment.fitNote,
      advertisedLevel: assessment.advertisedLevel,
      actualLevel: assessment.actualLevel
    };
  } catch (error) {
    /* Asked not to look: not a failure, and nothing to report. */
    if (!(error instanceof SkipSalary)) console.error("market salary lookup failed", error);
  }

  /* All three calls combined in a single figure: it is one generation to whoever pays. */
  const totalUsage = {
    inputTokens: triage.usage.inputTokens + usage.inputTokens + searchUsage.inputTokens,
    cachedTokens: triage.usage.cachedTokens + usage.cachedTokens + searchUsage.cachedTokens,
    outputTokens: triage.usage.outputTokens + usage.outputTokens + searchUsage.outputTokens,
    searches: searchUsage.searches
  };

  return {
    document: composeDocument(cv, verified.plan),
    locale,
    rationale: verified.plan.rationale,
    salary,
    violations: verified.violations,
    // Both calls, and the search fee, in one figure: two requests are still
    // one generation from the perspective of whoever pays for it.
    usage: {
      ...totalUsage,
      // The model that writes the résumé; the other two are in the total bill.
      model,
      usd: costOf(usage, model) + costOf(triage.usage, triageModel) + searchUsd
    }
  };
}

export { documentOf } from "./compose";
export type { ResumeDocument, Block, Section } from "./document";
