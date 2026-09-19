/**
 * Checks the plan against the facts it was built from.
 *
 * A prompt asking a model not to invent things is a request, not a guarantee.
 * This is the guarantee. It runs on every answer, before anything is rendered,
 * and it compares each rewritten sentence against the one fact it claims to
 * rewrite. A violation is reported and the sentence is replaced by its original
 * wording, so a bad rewrite degrades to the untailored truth rather than
 * reaching a recruiter.
 *
 * Two things are checked, because two things are what a model actually
 * fabricates when it is asked to make a résumé fit a posting:
 *
 * - a technology it saw in the posting and quietly attributed to the candidate;
 * - a number — a percentage, a team size, a duration — that sounds like the
 *   kind of thing a résumé says, and that nobody measured.
 *
 * Ordinary prose is left alone. The point is not to forbid rewriting; the point
 * is that rewriting may not add a fact.
 */
import { mentions, normalize, PRODUCTS, tokens } from "./vocabulary";
import type { CvFacts } from "./facts";
import { factIndex, vouchedGroups } from "./facts";
import type { CV } from "../../data/types";
import type { RewrittenFact, ResumePlan } from "./plan";

export interface Violation {
  sourceId: string;
  kind: "unknown-id" | "invented-term" | "invented-number" | "reused-fact" | "misplaced-fact";
  /** The offending token, or the id, for the report. */
  detail: string;
}

export interface VerifiedPlan {
  plan: ResumePlan;
  violations: Violation[];
}

/**
 * A word that carries a fact rather than grammar.
 *
 * Two ways to qualify. Most technology names betray themselves by shape: an
 * internal capital (PostgreSQL), a run of capitals (AWS, SQL), or a digit or
 * symbol (CI/CD, S3). Ordinary Portuguese and English prose has none of these.
 *
 * The rest do not. "Kafka", "Redis" and "Django" are shaped exactly like an
 * ordinary capitalised word, and a first version of this check let "Soluções
 * backend com Kafka" through while catching "RabbitMQ" in the same sentence.
 * Those are named in `PRODUCTS` instead of guessed at.
 */
function isClaimShaped(raw: string, word: string) {
  return /\p{Ll}\p{Lu}|\p{Lu}\p{Lu}|[0-9+#]/u.test(raw) || PRODUCTS.has(word);
}

/** Every number a sentence states, normalised so "1.000" and "1000" agree. */
function numbersIn(value: string) {
  return new Set(
    [...value.matchAll(/\d[\d.,]*/g)].map((match) => match[0].replace(/[.,](?=\d{3}\b)/g, ""))
  );
}

/** Every written form of a term, since the tokeniser splits "Node.js". */
function addForms(allowed: Set<string>, value: string) {
  allowed.add(normalize(value));
  for (const token of tokens(value)) allowed.add(token);
  for (const piece of normalize(value).split(/[ ./-]+/)) if (piece) allowed.add(piece);
}

/**
 * What a rewrite of this fact is allowed to say.
 *
 * The words of the fact itself, plus the skills the *scope* vouches for — and
 * scope here is not the whole CV, it is the entry the fact belongs to: the job
 * with all of its bullets, or the project with its stack. A summary paragraph
 * has the whole CV for scope, because the whole career is what it speaks for.
 *
 * That distinction separates two sentences that look equally true. "Backend em
 * Go" is true about the candidate and false about a job whose facts never
 * mention Go — and it is exactly the mistake a model makes when squeezing a
 * résumé into a posting. It does not conjure a technology from nothing; it
 * borrows one from another line of the same document.
 *
 * A whole synonym group comes in together: if the job says "Go", the rewrite
 * may say "Golang", because they are one name for one thing.
 */
function allowedTerms(cv: CV, source: string, scope: string) {
  const allowed = new Set<string>();
  const haystack = normalize(`${scope} ${source}`);

  for (const group of vouchedGroups(cv)) {
    if (group.some((label) => mentions(label, haystack))) {
      for (const label of group) addForms(allowed, label);
    }
  }
  addForms(allowed, source);
  return allowed;
}

function checkRewrite(cv: CV, fact: RewrittenFact, source: string, scope: string): Violation[] {
  const violations: Violation[] = [];
  const allowed = allowedTerms(cv, source, scope);

  for (const match of fact.text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}+#./-]*/gu)) {
    const raw = match[0].replace(/[./-]+$/, "");
    const word = normalize(raw);
    if (!word || !isClaimShaped(raw, word)) continue;
    if (allowed.has(word)) continue;
    // A compound the tokeniser would split, e.g. "Node.js" against "node".
    if (word.split(/[ ./-]+/).every((piece) => !piece || allowed.has(piece))) continue;
    violations.push({ sourceId: fact.sourceId, kind: "invented-term", detail: raw });
  }

  const known = numbersIn(source);
  for (const number of numbersIn(fact.text)) {
    if (!known.has(number)) {
      violations.push({ sourceId: fact.sourceId, kind: "invented-number", detail: number });
    }
  }

  return violations;
}

/**
 * Verifies a plan and returns a repaired one: any sentence that failed is put
 * back to the wording `src/data` holds. The document still renders, still fits
 * the posting in its selection and ordering, and says nothing untrue.
 */
export function verifyPlan(cv: CV, facts: CvFacts, plan: ResumePlan): VerifiedPlan {
  const index = factIndex(facts);
  const violations: Violation[] = [];
  const seen = new Set<string>();

  /* Everything the CV says, which is the scope of a summary paragraph. */
  const wholeCv = [
    ...facts.summary.map((f) => f.text),
    ...facts.skillGroups.flatMap((g) => [g.title, ...g.skills.map((s) => s.text)]),
    ...facts.positions.flatMap((e) => [e.label, ...e.highlights.map((h) => h.text)]),
    ...facts.projects.flatMap((e) => [e.label, ...e.highlights.map((h) => h.text)]),
    ...facts.keywords.map((f) => f.text)
  ].join(" ");

  /** The entry a bullet belongs to, which is what vouches for its claim. */
  const scopes = new Map<string, string>();
  for (const entry of [...facts.positions, ...facts.projects]) {
    const scope = [entry.label, ...entry.highlights.map((h) => h.text)].join(" ");
    for (const highlight of entry.highlights) scopes.set(highlight.id, scope);
  }

  const repair = (fact: RewrittenFact): RewrittenFact => {
    const source = index.get(fact.sourceId);
    if (source === undefined) {
      violations.push({ sourceId: fact.sourceId, kind: "unknown-id", detail: fact.sourceId });
      return fact;
    }
    // The same bullet twice is padding, and reads as padding. Kept once.
    if (seen.has(fact.sourceId)) {
      violations.push({ sourceId: fact.sourceId, kind: "reused-fact", detail: fact.sourceId });
      return { ...fact, text: source };
    }
    seen.add(fact.sourceId);

    const found = checkRewrite(cv, fact, source, scopes.get(fact.sourceId) ?? wholeCv);
    if (!found.length) return fact;
    violations.push(...found);
    return { ...fact, text: source };
  };

  /**
   * A bullet has to belong to the entry it was placed under.
   *
   * A sentence can be faithful to the fact it claims to rewrite and still lie,
   * by appearing under a different job: the work is real, the attribution is
   * not. Ids carry their entry — `pos.1.hl.2` only fits in `pos.1` — so the
   * check is cheap and does not rely on the model having been careful.
   */
  const belongs = (entryId: string) => (fact: RewrittenFact) => {
    if (fact.sourceId.startsWith(`${entryId}.`)) return true;
    violations.push({ sourceId: fact.sourceId, kind: "misplaced-fact", detail: entryId });
    return false;
  };

  const repairEntry = (entry: ResumePlan["positions"][number]) => ({
    ...entry,
    bullets: entry.bullets
      .filter(belongs(entry.id))
      .map(repair)
      .filter((fact) => index.has(fact.sourceId))
  });

  const repaired: ResumePlan = {
    ...plan,
    summary: plan.summary.map(repair).filter((fact) => index.has(fact.sourceId)),
    positions: plan.positions.map(repairEntry),
    projects: plan.projects.map(repairEntry),
    // Selections are ids, so an unknown one is dropped rather than repaired:
    // there is no wording to fall back to, only a reference to nothing.
    headlineIds: plan.headlineIds.filter((id) => keep(id, index, violations)),
    keywordIds: plan.keywordIds.filter((id) => keep(id, index, violations)),
    educationIds: plan.educationIds.filter((id) => keep(id, index, violations)),
    certificationIds: plan.certificationIds.filter((id) => keep(id, index, violations)),
    courseIds: plan.courseIds.filter((id) => keep(id, index, violations)),
    skillGroups: plan.skillGroups
      .filter((group) => keep(group.id, index, violations))
      .map((group) => ({ ...group, skillIds: group.skillIds.filter((id) => keep(id, index, violations)) }))
  };

  return { plan: repaired, violations };
}

function keep(id: string, index: Map<string, string>, violations: Violation[]) {
  if (index.has(id)) return true;
  violations.push({ sourceId: id, kind: "unknown-id", detail: id });
  return false;
}
