/**
 * Assembles the printable document from the source CV and a verified plan.
 *
 * This is where the guarantee becomes structural. The plan contributes only
 * two things: an order, and the wording of prose. Everything a lie would be
 * made of — employer, dates, location, links, credential numbers, degrees,
 * contact details — is read here from `src/data`, on a path the model's answer
 * never touches. Deleting `verify.ts` would weaken the wording; it would still
 * be impossible for a response to change where the candidate worked.
 *
 * Sections the plan left empty do not print, so the sheet gets shorter when the
 * posting gives no reason for a section to exist. Education, certifications and
 * languages are always printed: an ATS scores their absence, and they are short.
 */
import type { CV } from "../../data/types";
import { labelOfTerm as labelOf } from "../headline";
import type { ResumePlan } from "./plan";
import type { Block, MovableKey, ResumeDocument, Section, SectionKey } from "./document";
import { ALWAYS_PRINTED, MOVABLE, withoutEmptySections } from "./document";

/** `pos.3` and `grp.1.sk.4` carry their index; this reads it back. */
function indexOf(id: string, prefix: string): number | null {
  const match = new RegExp(`^${prefix}\\.(\\d+)$`).exec(id);
  return match ? Number(match[1]) : null;
}

function skillIndexes(id: string): [number, number] | null {
  const match = /^grp\.(\d+)\.sk\.(\d+)$/.exec(id);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** The indexes a list of ids points at, in the order the plan gave them. */
function indexesOf(ids: string[], prefix: string): number[] {
  return ids
    .map((id) => indexOf(id, prefix))
    .filter((index): index is number => index !== null);
}

/**
 * The untailored document, for the print page and the exporters. The same
 * renderer draws this and a tailored one, which is the point of the block
 * model: there is one sheet, not a plain one and an AI one that can drift apart.
 */
export function documentOf(cv: CV): ResumeDocument {
  const { labels } = cv;
  return withoutEmptySections({
    locale: cv.locale,
    lang: cv.lang,
    head: headOf(cv, cv.role, [...cv.disciplines, ...cv.technologies].map(labelOf)),
    meta: metaOf(cv, cv.role),
    // Nothing chose an order for this document, so the middle keeps the one a
    // résumé is conventionally read in.
    sections: order(MOVABLE, {
      ...sectionsOf(cv),
      summary: section("summary", labels.summary, { kind: "paragraphs", items: cv.summary }),
      skills: section("skills", labels.skills, {
        kind: "definitions",
        items: cv.skillGroups.map((group) => ({
          term: group.title,
          description: `${group.skills.map(labelOf).join(", ")}.`
        }))
      }),
      experience: section(
        "experience",
        labels.experience,
        positionsBlock(cv, cv.positions.map((_, index) => index))
      ),
      projects: section(
        "projects",
        labels.projects,
        projectsBlock(cv, cv.projects.map((_, index) => index))
      ),
      keywords: section("keywords", labels.keywords, {
        kind: "inline",
        text: `${cv.keywords.join(", ")}.`
      })
    })
  });
}

/**
 * The tailored document. `plan` must already have been through `verifyPlan`:
 * composing an unverified plan is the one way to get a rewrite in here that
 * nothing has checked.
 */
export function composeDocument(cv: CV, plan: ResumePlan): ResumeDocument {
  const { labels } = cv;

  const headline = plan.headlineIds
    .map((id) => {
      const discipline = indexOf(id, "dsc");
      if (discipline !== null) return cv.disciplines[discipline];
      const technology = indexOf(id, "tec");
      return technology !== null ? cv.technologies[technology] : null;
    })
    .filter((term): term is NonNullable<typeof term> => term !== null)
    .map(labelOf);

  const summary = plan.summary.map((fact) => fact.text);

  const skills: Block = {
    kind: "definitions",
    items: plan.skillGroups
      .map((group) => {
        const groupIndex = indexOf(group.id, "grp");
        if (groupIndex === null || !cv.skillGroups[groupIndex]) return null;
        const source = cv.skillGroups[groupIndex];
        const kept = group.skillIds
          .map(skillIndexes)
          .filter((pair): pair is [number, number] => pair !== null && pair[0] === groupIndex)
          .map(([, skillIndex]) => source.skills[skillIndex])
          .filter(Boolean);
        if (!kept.length) return null;
        return { term: source.title, description: `${kept.map(labelOf).join(", ")}.` };
      })
      .filter((item): item is { term: string; description: string } => item !== null)
  };

  const keywords = plan.keywordIds
    .map((id) => indexOf(id, "kw"))
    .filter((index): index is number => index !== null && !!cv.keywords[index])
    .map((index) => cv.keywords[index]);

  return withoutEmptySections({
    locale: cv.locale,
    lang: cv.lang,
    // The advertised title, which the candidate consents to on the panel, is
    // the one string from the posting that reaches the sheet.
    head: headOf(cv, plan.targetRole || cv.role, headline.length ? headline : [cv.role]),
    meta: metaOf(cv, plan.targetRole || cv.role),
    // The order the plan asked for, not the order this file happens to build
    // them in. That is the whole difference between a layout and a decision.
    sections: order(plan.sectionOrder, {
      ...sectionsOf(cv, {
        education: indexesOf(plan.educationIds, "edu"),
        certifications: indexesOf(plan.certificationIds, "cer"),
        courses: indexesOf(plan.courseIds, "crs")
      }),
      summary: section("summary", labels.summary, { kind: "paragraphs", items: summary }),
      skills: section("skills", labels.skills, skills),
      experience: section("experience", labels.experience, positionsBlock(cv, [], plan)),
      projects: section("projects", labels.projects, projectsBlock(cv, [], plan)),
      keywords: section("keywords", labels.keywords, {
        kind: "inline",
        text: keywords.length ? `${keywords.join(", ")}.` : ""
      })
    })
  });
}

const section = (key: SectionKey, heading: string, block: Block, note?: string): Section => ({
  key,
  heading,
  block,
  note: note ?? null
});

/**
 * Lays the document out: the pinned sections where they belong, the middle in
 * the order asked for.
 *
 * A repeated key is ignored rather than rejected, since a plan that named one
 * twice meant to print it once. Anything in `ALWAYS_PRINTED` that the order left out
 * is appended, so omitting education moves it to the end instead of deleting it.
 */
function order(middle: readonly MovableKey[], sections: Record<SectionKey, Section>): Section[] {
  const seen = new Set<MovableKey>();
  const chosen: Section[] = [];

  for (const key of middle) {
    if (!sections[key] || seen.has(key)) continue;
    seen.add(key);
    chosen.push(sections[key]);
  }
  // Omitting one of these moves it to the end; it does not remove it.
  for (const key of ALWAYS_PRINTED) {
    if (!seen.has(key)) chosen.push(sections[key]);
  }
  // The summary opens and the keywords close, whatever the middle came out as.
  return [sections.summary, ...chosen, sections.keywords];
}

function headOf(cv: CV, role: string, headline: string[]): ResumeDocument["head"] {
  const { contact } = cv;
  return {
    name: cv.name,
    role,
    headline: headline.join(" · "),
    // Read from `src/data` in every path through this module. No plan field
    // reaches these lines, which is why no answer can change how to reach him.
    contact: [
      { text: contact.email, href: `mailto:${contact.email}` },
      { text: contact.phone },
      { text: contact.location },
      { text: bare(contact.website), href: contact.website },
      { text: bare(contact.linkedin), href: contact.linkedin },
      { text: bare(contact.github), href: contact.github }
    ]
  };
}

/**
 * What the exported file records about itself. The tailored document says
 * which posting it was written for, because a folder of applications is
 * otherwise six files with the same name.
 */
function metaOf(cv: CV, role: string): ResumeDocument["meta"] {
  return {
    title: role === cv.role ? cv.seoTitle : `${cv.name} — ${role}`,
    description: cv.seoDescription,
    keywords: cv.keywords
  };
}

/**
 * Jobs, in the CV's own order. A plan may drop bullets and may drop a job
 * entirely, but the order is taken from `src/data` rather than from the plan:
 * a career is a timeline, and a model that reorders it has changed a fact
 * without writing a word.
 */
function positionsBlock(cv: CV, all: number[], plan?: ResumePlan): Block {
  const chosen = plan
    ? new Map(
        plan.positions
          .map((entry) => [indexOf(entry.id, "pos"), entry] as const)
          .filter((pair): pair is [number, (typeof plan.positions)[number]] => pair[0] !== null)
      )
    : null;

  const indexes = chosen ? [...chosen.keys()].sort((a, b) => a - b) : all;

  return {
    kind: "entries",
    items: indexes
      .filter((index) => cv.positions[index])
      .map((index) => {
        const position = cv.positions[index];
        const bullets = chosen
          ? chosen.get(index)!.bullets.map((fact) => fact.text)
          : position.highlights;
        return {
          title: position.title,
          org: { text: position.company, href: position.companyUrl },
          meta: `${position.start} – ${position.end} · ${position.employment} · ${position.location}`,
          bullets,
          tags: [],
          link: null
        };
      })
      .filter((entry) => entry.bullets.length > 0)
  };
}

function projectsBlock(cv: CV, all: number[], plan?: ResumePlan): Block {
  const chosen = plan
    ? plan.projects
        .map((entry) => ({ index: indexOf(entry.id, "prj"), entry }))
        .filter((pair): pair is { index: number; entry: (typeof plan.projects)[number] } => pair.index !== null)
    : null;

  // Unlike jobs, projects carry no chronology, so the plan's order is kept:
  // the project the posting cares about should be the first one read.
  const items = chosen
    ? chosen.filter((pair) => cv.projects[pair.index])
    : all.filter((index) => cv.projects[index]).map((index) => ({ index, entry: null }));

  return {
    kind: "entries",
    items: items
      .map(({ index, entry }) => {
        const project = cv.projects[index];
        const link = project.repository ?? project.url ?? null;
        // The caption says what the address is, since a repository and a live
        // site are read differently by whoever follows the link.
        const caption = project.repository ? cv.labels.repository : cv.labels.liveSite;
        return {
          title: project.name,
          org: null,
          meta: link ? `${project.context} · ${caption}:` : project.context,
          bullets: entry ? entry.bullets.map((fact) => fact.text) : project.highlights,
          stack: project.stack,
          link
        };
      })
      .filter((item) => item.bullets.length > 0)
      .map(({ stack, ...item }) => ({ ...item, tags: stack }))
  };
}

/**
 * The sections that are the same in both documents.
 *
 * They hold facts with no prose to rewrite and no relevance to weigh, so
 * nothing about a posting could change them. A plan may still decide *where*
 * they go; it may not decide whether they exist.
 */
function sectionsOf(
  cv: CV,
  /**
   * Which of these facts to print. Absent, everything prints — that is the
   * untailored document. Present, the plan decides, except for education:
   * an empty selection there keeps every degree, because a résumé with no
   * education section is scored down and a degree is not what makes one long.
   */
  chosen?: { education: number[]; certifications: number[]; courses: number[] }
): Pick<Record<SectionKey, Section>, (typeof ALWAYS_PRINTED)[number]> {
  const { labels } = cv;
  const pick = <T>(items: T[], indexes: number[] | undefined, keepAllWhenEmpty = false) =>
    !indexes || (keepAllWhenEmpty && indexes.length === 0)
      ? items
      : indexes.filter((index) => items[index] !== undefined).map((index) => items[index]);

  const education = pick(cv.education, chosen?.education, true);
  const certifications = pick(cv.certifications, chosen?.certifications);
  const courses = pick(cv.courses, chosen?.courses);

  return {
    education: {
      key: "education",
      heading: labels.education,
      block: {
        kind: "lines",
        items: education.map((entry) => ({
          label: entry.degree,
          text: `${entry.institution}, ${entry.period}${entry.note ? ` (${entry.note})` : ""}`,
          link: entry.url ? { text: labels.diploma, href: entry.url } : null
        }))
      }
    },
    certifications: {
      key: "certifications",
      heading: labels.certifications,
      block: {
        kind: "lines",
        items: certifications.map((certification) => ({
          label: certification.name,
          text: `${certification.issuer}, ${certification.issued}`,
          // The id is the link's text. It is short, it is what the issuer asks
          // for when someone verifies by hand, and it does not wrap.
          link: certification.url
            ? { text: certification.credentialId ?? bare(certification.url), href: certification.url }
            : null
        }))
      }
    },
    courses: {
      key: "courses",
      heading: labels.courses,
      block: {
        kind: "lines",
        items: courses.map((course) => ({
          label: course.name,
          text: `${course.issuer}, ${course.workload}, ${course.period}`,
          // The certificate itself, so the line is checkable rather than
          // merely claimed.
          link: course.url ? { text: labels.certificate, href: course.url } : null
        }))
      }
    },
    languages: {
      key: "languages",
      heading: labels.languages,
      block: {
        kind: "lines",
        items: cv.languages.map((language) => ({
          label: language.name,
          text: language.level,
          link: null
        }))
      }
    }
  };
}
