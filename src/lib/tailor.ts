/**
 * Adapts the CV to one job posting.
 *
 * The only operations are reordering and surfacing: every skill, project and
 * bullet in the output already existed in the input, with its text unchanged.
 * Nothing is written from the posting into the CV, so the tailored document
 * cannot claim anything the untailored one does not. `tailorCv` returns a
 * permutation of the input, and the test suite asserts exactly that.
 */
import type { CV, Position, Project, Skill, SkillGroup, Term } from "../data/types";
import { headlineOf, labelsOfTerm } from "./headline";
import {
  mentions,
  normalize,
  buildVocabulary,
  relevantSection,
  splitRequirements,
  technicalTerms,
  terms,
  weightOf
} from "./posting";

export interface TailorReport {
  /** Share of the posting's *required* technical vocabulary the CV covers. */
  technicalCoverage: number;
  matched: { term: string; count: number }[];
  missing: { term: string; count: number }[];
  /** Terms the posting itself marks as optional, reported but never scored. */
  missingPreferred: { term: string; count: number }[];
  /** Skills promoted to the front of their group, for the reader's benefit. */
  promoted: string[];
  /**
   * The title the posting advertises. It is the most searched keyword in an
   * ATS, and stating the role you are applying for claims no ability, so the
   * panel offers it as the target-role line. Never applied without consent.
   */
  suggestedTitle: string | null;
  /** strong at 80+, moderate from 65, weak below, per published benchmarks. */
  verdict: "forte" | "médio" | "fraco";
}

export interface TailoredCV {
  cv: CV;
  report: TailorReport;
}

export interface JobInput {
  /** Typed in its own field: guessing it from the text was unreliable. */
  title?: string;
  description: string;
}

/**
 * The advertised title is the most searched keyword in an applicant tracking
 * system, so a skill the title names outranks one buried in the body. Without
 * this, a posting headed "Software Engineer GO" ranked the group holding Go
 * below a group that merely mentioned more terms.
 */
const TITLE_WEIGHT = 12;

/**
 * A posting's own hierarchy is respected: what it requires outranks what it
 * would merely like. Without this, "Azure DevOps" listed under "what improves
 * your chances" pushed DevOps ahead of the discipline the job is actually for.
 */
const REQUIRED_WEIGHT = 3;
const PREFERRED_WEIGHT = 1;

/** Sorts descending by score while preserving the original order on ties. */
function stableByScore<T>(items: T[], score: (item: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

function textOf(values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function tailorCv(cv: CV, job: JobInput | string): TailoredCV {
  const input: JobInput = typeof job === "string" ? { description: job } : job;
  const rawPosting = input.description;
  const title = input.title?.trim() ?? "";

  // Scoring reads only the part of the posting that describes the work, and
  // keeps its requirements apart from its wishes.
  const sections = splitRequirements(rawPosting);
  const posting = relevantSection(rawPosting);
  const titleTerms = title ? terms(title) : new Map<string, number>();
  const requiredScoring = terms(sections.required);
  const preferredScoring = sections.preferred ? terms(sections.preferred) : new Map<string, number>();
  const normalizedPosting = normalize(`${title}\n${posting}`);

  /** How much the posting wants one wording, by where it asks for it. */
  const demandFor = (label: string) =>
    weightOf(label, titleTerms) * TITLE_WEIGHT +
    weightOf(label, requiredScoring) * REQUIRED_WEIGHT +
    weightOf(label, preferredScoring) * PREFERRED_WEIGHT;

  const scoreText = (value: string) => {
    const normalized = normalize(value);
    let score = 0;
    for (const [term, count] of titleTerms) {
      if (mentions(term, normalized)) score += count * TITLE_WEIGHT;
    }
    for (const [term, count] of requiredScoring) {
      if (mentions(term, normalized)) score += count * REQUIRED_WEIGHT;
    }
    for (const [term, count] of preferredScoring) {
      if (mentions(term, normalized)) score += count * PREFERRED_WEIGHT;
    }
    return score;
  };

  /** A term is wanted if any of its names is, since they mean the same thing. */
  const scoreTerm = (term: Term) =>
    labelsOfTerm(term).reduce(
      (sum, label) => sum + demandFor(label) + (mentions(label, normalizedPosting) ? 2 : 0),
      0
    );

  /*
   * The headline says what the job is, so only what the posting demands may
   * reorder it. Counting wishes here let a single "Azure DevOps" under "what
   * improves your chances" open the resume with DevOps, for a Go backend job.
   */
  const normalizedDemand = normalize(`${title}\n${sections.required}`);
  const demandedBy = (label: string) =>
    weightOf(label, titleTerms) * TITLE_WEIGHT +
    weightOf(label, requiredScoring) * REQUIRED_WEIGHT +
    (mentions(label, normalizedDemand) ? 2 : 0);

  const scoreHeadline = (term: Term) => {
    const named = labelsOfTerm(term).reduce((sum, label) => sum + demandedBy(label), 0);
    // A discipline the posting never names still counts through the skills it
    // does ask for, which is how a Go microservices job reads as backend.
    const shown = (term.evidence ?? []).reduce((sum, skill) => sum + demandedBy(skill), 0);
    return named * 2 + shown;
  };

  const scoreSkill = (skill: Skill) => scoreTerm(skill);

  const promoted: string[] = [];

  const skillGroups: SkillGroup[] = stableByScore(
    cv.skillGroups.map((group) => {
      const ordered = stableByScore(group.skills, scoreSkill);
      ordered.forEach((skill, index) => {
        const before = group.skills.indexOf(skill);
        if (scoreSkill(skill) > 0 && index < before) promoted.push(skill.name);
      });
      return { ...group, skills: ordered };
    }),
    /*
     * The strongest single match decides, with breadth only as a tiebreak.
     * Summing every skill let a large group win on volume: a posting headed
     * "Software Engineer GO" ranked the group holding Go below one that merely
     * listed more matching items.
     */
    (group) => {
      const scores = group.skills.map(scoreSkill);
      const best = Math.max(0, ...scores);
      const breadth = scores.reduce((sum, score) => sum + score, 0);
      return best * 10 + breadth;
    }
  );

  // Chronology is information, so positions keep their order; only the bullets
  // inside each one are reordered, to put the most relevant first.
  const positions: Position[] = cv.positions.map((position) => ({
    ...position,
    highlights: stableByScore(position.highlights, scoreText)
  }));

  const projects: Project[] = stableByScore(
    cv.projects.map((project) => ({
      ...project,
      highlights: stableByScore(project.highlights, scoreText)
    })),
    (project) => scoreText(textOf([project.name, project.context, ...project.stack, ...project.highlights]))
  );

  const keywords = stableByScore(cv.keywords, (keyword) =>
    mentions(keyword, normalizedPosting) ? 1 : 0
  );

  // The summary is weighted heavily by parsers, so its most relevant paragraph
  // leads. The sentences themselves are untouched.
  const summary = stableByScore(cv.summary, scoreText);

  // The headline is the first line a parser and a reader both meet, so it
  // leads with the discipline and the technology the posting is about.
  const disciplines = stableByScore(cv.disciplines, scoreHeadline);
  const technologies = stableByScore(cv.technologies, scoreHeadline);

  // The CV's own words vouch for a posting term being a real skill name.
  const vocabulary = buildVocabulary([
    cv.role,
    ...cv.disciplines.flatMap(labelsOfTerm),
    ...cv.technologies.flatMap(labelsOfTerm),
    ...cv.skillGroups.flatMap((group) => [
      group.title,
      ...group.skills.flatMap((skill) => [skill.name, ...(skill.alias ?? [])])
    ]),
    ...cv.projects.flatMap((project) => project.stack),
    ...cv.keywords
  ]);
  const technical = technicalTerms(`${title}\n${rawPosting}`, vocabulary);
  const cvHaystack = normalize(
    textOf([
      cv.role,
      headlineOf(cv),
      ...cv.summary,
      ...cv.skillGroups.flatMap((g) => [g.title, ...g.skills.flatMap((s) => [s.name, ...(s.alias ?? [])])]),
      ...cv.positions.flatMap((p) => [p.title, p.company, ...p.highlights]),
      ...cv.projects.flatMap((p) => [p.name, ...p.stack, ...p.highlights]),
      ...cv.education.map((e) => `${e.degree} ${e.institution}`),
      ...cv.certifications.map((c) => `${c.name} ${c.issuer}`),
      ...cv.keywords
    ])
  );

  // The title states a requirement as much as the requirements list does.
  const requiredTerms = terms(`${title}\n${sections.required}`);
  const preferredTerms = preferredScoring;

  const isTechnical = (term: string) => term.split(" ").every((word) => technical.has(word));

  /*
   * The posting's phrases drop stopwords ("bancos de dados" becomes "bancos
   * dados"), so comparing them against raw CV text misses real matches. The CV
   * is tokenised the same way before the comparison.
   */
  const cvTerms = buildVocabulary([
    cv.role,
    ...cv.disciplines.flatMap(labelsOfTerm),
    ...cv.technologies.flatMap(labelsOfTerm),
    ...cv.summary,
    ...cv.skillGroups.flatMap((group) => [
      group.title,
      ...group.skills.flatMap((skill) => [skill.name, ...(skill.alias ?? [])])
    ]),
    ...cv.positions.flatMap((position) => [position.title, position.company, ...position.highlights]),
    ...cv.projects.flatMap((project) => [project.name, ...project.stack, ...project.highlights]),
    ...cv.education.map((entry) => `${entry.degree} ${entry.institution}`),
    ...cv.certifications.map((certification) => certification.name),
    ...cv.keywords
  ]);
  const covered = (term: string) => cvTerms.has(term) || mentions(term, cvHaystack);

  const matched: TailorReport["matched"] = [];
  const missing: TailorReport["missing"] = [];
  for (const [term, count] of [...requiredTerms].sort((a, b) => b[1] - a[1])) {
    if (!isTechnical(term)) continue;
    (covered(term) ? matched : missing).push({ term, count });
  }

  const missingPreferred: TailorReport["missing"] = [];
  for (const [term, count] of [...preferredTerms].sort((a, b) => b[1] - a[1])) {
    if (!isTechnical(term) || covered(term)) continue;
    if (requiredTerms.has(term)) continue;
    missingPreferred.push({ term, count });
  }

  const weigh = (list: { count: number }[]) => list.reduce((sum, entry) => sum + entry.count, 0);
  const total = weigh(matched) + weigh(missing);
  const coverage = total === 0 ? 0 : (weigh(matched) / total) * 100;

  return {
    cv: { ...cv, disciplines, technologies, summary, skillGroups, positions, projects, keywords },
    report: {
      technicalCoverage: coverage,
      matched,
      missing,
      missingPreferred,
      promoted: [...new Set(promoted)],
      suggestedTitle: title || null,
      verdict: coverage >= 80 ? "forte" : coverage >= 65 ? "médio" : "fraco"
    }
  };
}
