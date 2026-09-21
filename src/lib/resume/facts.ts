/**
 * The CV as addressable facts.
 *
 * Every sentence, skill and heading in `src/data` gets a stable id. The model
 * is shown these ids and answers with them, which is the whole reason it cannot
 * invent an employer or a date: it never receives a field it is allowed to fill
 * freely with a fact. It selects ids, and rewrites prose bound to an id.
 *
 * Ids are positional (`pos.0.hl.2`) rather than derived from the text, so two
 * identical bullet points in different jobs stay distinguishable, and so a typo
 * fix in `src/data` does not silently repoint an id at different content.
 */
import type { CV, Position, Project, Skill } from "../../data/types";
import { labelOfTerm, labelsOfTerm } from "../headline";

export interface Fact {
  id: string;
  /** What the model is shown and asked to rewrite or select. */
  text: string;
}

export interface SkillGroupFacts {
  id: string;
  title: string;
  skills: (Fact & { skill: Skill })[];
}

export interface EntryFacts<T> {
  id: string;
  source: T;
  /** The line a parser reads for employer, dates and place. Never rewritten. */
  label: string;
  highlights: Fact[];
}

/**
 * Everything the model may work with, and nothing else. What is absent here is
 * absent from its input: contact details, credential ids and ISO dates are
 * stitched in afterwards from `src/data`, so no rewrite can touch them.
 */
export interface CvFacts {
  disciplines: Fact[];
  technologies: Fact[];
  summary: Fact[];
  skillGroups: SkillGroupFacts[];
  positions: EntryFacts<Position>[];
  projects: EntryFacts<Project>[];
  keywords: Fact[];
  /*
   * Selectable like everything else. They used to be printed whole from
   * `src/data`, which was fine with three certificates and wrong with twelve:
   * a posting for a Go backend has no reason to read about electronic law.
   */
  education: Fact[];
  certifications: Fact[];
  courses: Fact[];
}

/**
 * The prefixes an id may carry.
 *
 * Exported because `schema.ts` builds the id pattern from them rather than
 * restating it. Two hand-written copies of this format do not fail loudly when
 * they disagree: strict decoding simply forces the model to answer with
 * something that matches the pattern, and what it answers points at nothing.
 */
export const ID_PREFIXES = ["dsc", "tec", "sum", "grp", "pos", "prj", "kw", "edu", "cer", "crs"] as const;

/** The nested prefixes, as in `grp.1.sk.4` and `pos.0.hl.2`. */
export const NESTED_PREFIXES = ["sk", "hl"] as const;

export const factIds = {
  discipline: (index: number) => `dsc.${index}`,
  technology: (index: number) => `tec.${index}`,
  summary: (index: number) => `sum.${index}`,
  group: (index: number) => `grp.${index}`,
  skill: (group: number, index: number) => `grp.${group}.sk.${index}`,
  position: (index: number) => `pos.${index}`,
  positionHighlight: (position: number, index: number) => `pos.${position}.hl.${index}`,
  project: (index: number) => `prj.${index}`,
  projectHighlight: (project: number, index: number) => `prj.${project}.hl.${index}`,
  keyword: (index: number) => `kw.${index}`,
  education: (index: number) => `edu.${index}`,
  certification: (index: number) => `cer.${index}`,
  course: (index: number) => `crs.${index}`
};

export function factsOf(cv: CV): CvFacts {
  return {
    disciplines: cv.disciplines.map((term, index) => ({
      id: factIds.discipline(index),
      text: labelOfTerm(term)
    })),
    technologies: cv.technologies.map((term, index) => ({
      id: factIds.technology(index),
      text: labelOfTerm(term)
    })),
    summary: cv.summary.map((paragraph, index) => ({
      id: factIds.summary(index),
      text: paragraph
    })),
    skillGroups: cv.skillGroups.map((group, groupIndex) => ({
      id: factIds.group(groupIndex),
      title: group.title,
      skills: group.skills.map((skill, skillIndex) => ({
        id: factIds.skill(groupIndex, skillIndex),
        text: labelOfTerm(skill),
        skill
      }))
    })),
    positions: cv.positions.map((position, positionIndex) => ({
      id: factIds.position(positionIndex),
      source: position,
      label: `${position.title} — ${position.company} · ${position.start} – ${position.end}`,
      highlights: position.highlights.map((highlight, index) => ({
        id: factIds.positionHighlight(positionIndex, index),
        text: highlight
      }))
    })),
    projects: cv.projects.map((project, projectIndex) => ({
      id: factIds.project(projectIndex),
      source: project,
      label: `${project.name} · ${project.context} · ${project.stack.join(", ")}`,
      highlights: project.highlights.map((highlight, index) => ({
        id: factIds.projectHighlight(projectIndex, index),
        text: highlight
      }))
    })),
    keywords: cv.keywords.map((keyword, index) => ({
      id: factIds.keyword(index),
      text: keyword
    })),
    education: cv.education.map((entry, index) => ({
      id: factIds.education(index),
      text: `${entry.degree} — ${entry.institution}, ${entry.period}`
    })),
    certifications: cv.certifications.map((certification, index) => ({
      id: factIds.certification(index),
      text: `${certification.name} — ${certification.issuer}, ${certification.issued}`
    })),
    /*
     * The period included, because the sheet prints it and the model was
     * deciding without it. Whether a short course is worth a line depends on
     * when it was taken as much as on its subject, and a model shown only
     * "15 h" reads every course as equally old.
     */
    courses: cv.courses.map((course, index) => ({
      id: factIds.course(index),
      text: `${course.name} — ${course.issuer}, ${course.workload}, ${course.period}`
    }))
  };
}

/** Flat lookup from id to the original text, for verification and assembly. */
export function factIndex(facts: CvFacts): Map<string, string> {
  const index = new Map<string, string>();
  const add = (fact: Fact) => index.set(fact.id, fact.text);

  facts.disciplines.forEach(add);
  facts.technologies.forEach(add);
  facts.summary.forEach(add);
  facts.keywords.forEach(add);
  facts.education.forEach(add);
  facts.certifications.forEach(add);
  facts.courses.forEach(add);
  for (const group of facts.skillGroups) {
    index.set(group.id, group.title);
    group.skills.forEach(add);
  }
  for (const entry of [...facts.positions, ...facts.projects]) {
    index.set(entry.id, entry.label);
    entry.highlights.forEach(add);
  }
  return index;
}

/**
 * What the CV vouches for, grouped by synonym.
 *
 * Each group is a set of names for one thing — `["Go", "Golang"]` — which is
 * how verification knows that swapping one for the other is rephrasing rather
 * than inventing. Grouped rather than flattened, because the question it
 * answers is "does this job vouch for this skill?", and the skill has to be
 * recognisable by any of its names.
 */
export function vouchedGroups(cv: CV): string[][] {
  const groups: string[][] = [[cv.role]];

  for (const term of [...cv.disciplines, ...cv.technologies]) groups.push(labelsOfTerm(term));
  for (const group of cv.skillGroups) {
    groups.push([group.title]);
    for (const skill of group.skills) groups.push(labelsOfTerm(skill));
  }
  for (const project of cv.projects) for (const item of project.stack) groups.push([item]);
  for (const keyword of cv.keywords) groups.push([keyword]);
  for (const certification of cv.certifications) groups.push([certification.name]);
  for (const entry of cv.education) groups.push([entry.degree]);

  return groups.filter((group) => group.some(Boolean));
}
