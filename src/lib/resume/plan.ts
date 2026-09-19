/**
 * What the model is allowed to answer.
 *
 * Not a résumé: a *plan* for one. Every field is either an id drawn from the
 * facts it was given, or prose bound to such an id. There is no field in which
 * a company, a date, a link or a credential number could be written, because
 * those are never sent to the model and never read back from it.
 *
 * The shape is mirrored by `schema.ts`, which is the JSON Schema enforced by
 * the API with `strict: true`, so a malformed plan is impossible rather than
 * merely unlikely.
 */

import type { MovableKey } from "./document";

/** A rewritten sentence, and the fact it is a rewrite of. */
export interface RewrittenFact {
  /** An id from the facts sent in the prompt. */
  sourceId: string;
  /**
   * The same fact, said in the posting's vocabulary. May be shortened, split
   * or simplified; may not add a technology, a number or an outcome that the
   * source sentence does not already contain. Verified in `verify.ts`.
   */
  text: string;
}

export interface PlannedEntry {
  /** `pos.N` or `prj.N`. */
  id: string;
  /** Bullets kept, in the order they should print. Dropping one is allowed. */
  bullets: RewrittenFact[];
}

export interface PlannedGroup {
  /** `grp.N`. */
  id: string;
  /** Skill ids kept, most relevant first. */
  skillIds: string[];
}

export interface ResumePlan {
  /**
   * The order of the middle of the document.
   *
   * Only the movable sections appear here. The head, the summary under it and
   * the closing keywords are pinned, so they are not the model's to move — see
   * `document.ts` on why each one is where it is. Within this list the posting
   * decides: skills first for a stack-driven job, projects above employment
   * when the projects are the stronger evidence.
   *
   * Two further orders are the model's, and are not expressed here because
   * they live inside their own sections: the order of the projects, and the
   * order of the keywords.
   */
  sectionOrder: MovableKey[];

  /**
   * The role the posting advertises, copied from the posting itself. The one
   * string in the plan that comes from the posting rather than the CV: naming
   * the job you are applying to asserts no ability, and it is the single most
   * searched keyword in an applicant tracking system.
   */
  targetRole: string;
  /** Ids from `dsc.*` and `tec.*`, in the order the headline should read. */
  headlineIds: string[];
  /** The summary, rewritten for this posting. At most three paragraphs. */
  summary: RewrittenFact[];
  skillGroups: PlannedGroup[];
  positions: PlannedEntry[];
  projects: PlannedEntry[];
  /** Ids from `kw.*`, keeping only what the posting makes relevant. */
  keywordIds: string[];
  /**
   * Ids from `edu.*`. Leaving this empty keeps every degree rather than none:
   * a résumé with no education section at all is scored down, and a degree is
   * rarely the thing that makes a document too long.
   */
  educationIds: string[];
  /** Ids from `cer.*`. Keep what this posting gives a reason to read. */
  certificationIds: string[];
  /** Ids from `crs.*`. Same rule, and these are the first to go. */
  courseIds: string[];
  /**
   * Why the shape came out this way, in one or two sentences, for the person
   * reviewing it before sending. Never printed on the sheet.
   */
  rationale: string;
}
