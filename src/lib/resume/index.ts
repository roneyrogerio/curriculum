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
import { verifyPlan, type Violation } from "./verify";

export interface TailorRequest {
  /** The posting, title included: the title is the first line of any posting. */
  posting: string;
  /** Forced locale. Left out, the posting's own language decides. */
  locale?: Locale;
  model?: string;
}

export interface TailorResult {
  document: ResumeDocument;
  locale: Locale;
  /** The model's own account of what it led with and what it cut. */
  rationale: string;
  /** Empty on a clean answer. Non-empty means a rewrite was rolled back. */
  violations: Violation[];
  usage: Usage & { model: string; usd: number };
}

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

  return {
    document: composeDocument(cv, verified.plan),
    locale,
    rationale: verified.plan.rationale,
    violations: verified.violations,
    usage: { ...usage, model, usd: costOf(usage, model) }
  };
}

export { documentOf } from "./compose";
export type { ResumeDocument, Block, Section } from "./document";
