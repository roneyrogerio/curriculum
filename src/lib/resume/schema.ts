/**
 * The JSON Schema sent to OpenAI as a Structured Output.
 *
 * With `strict: true` the API constrains decoding to this grammar, so the
 * answer parses or the request fails — there is no half-valid response to
 * defend against, and no retry loop to write. That is why the schema is worth
 * keeping exact rather than permissive.
 *
 * The subset the API accepts is narrower than JSON Schema: every property must
 * be listed in `required`, every object must set `additionalProperties: false`,
 * and an optional value is expressed as a union with null rather than by
 * omission. The types in `plan.ts` are written to match that subset, so the two
 * can stay in step.
 */
import { MOVABLE } from "./document";
import { ID_PREFIXES, NESTED_PREFIXES, type CvFacts } from "./facts";

/**
 * Ids are machine-written, so the format is pinned rather than described — but
 * pinned from the prefixes that `facts.ts` actually emits, never from a
 * hand-written guess. A pattern that disagrees with the ids does not fail
 * loudly: strict decoding simply forces the model to produce something that
 * matches, and what it produces points at nothing.
 */
export const ID_PATTERN =
  `^(${ID_PREFIXES.join("|")})\\.[0-9]+(\\.(${NESTED_PREFIXES.join("|")})\\.[0-9]+)?$`;

const idArray = (description: string) => ({
  type: "array" as const,
  description,
  items: { type: "string" as const, pattern: ID_PATTERN }
});

const rewrittenFact = {
  type: "object",
  additionalProperties: false,
  required: ["sourceId", "text"],
  properties: {
    sourceId: {
      type: "string",
      pattern: ID_PATTERN,
      description: "The id of the fact this sentence rewrites. Must be one of the ids given."
    },
    text: {
      type: "string",
      description:
        "The same fact in the posting's vocabulary: shorter and plainer is better. " +
        "It may drop detail; it may not add any technology, number, outcome or " +
        "responsibility that the original sentence does not already state."
    }
  }
} as const;

const plannedEntry = {
  type: "object",
  additionalProperties: false,
  required: ["id", "bullets"],
  properties: {
    id: { type: "string", pattern: ID_PATTERN },
    bullets: {
      type: "array",
      description: "The bullets worth keeping for this posting, most relevant first.",
      items: rewrittenFact
    }
  }
} as const;

/**
 * Built from the facts rather than kept as a constant, so the limits stated to
 * the model are the real ones: a model told it may return four summary
 * paragraphs when the CV has three has been invited to write a fourth.
 */
export function planSchema(facts: CvFacts) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "targetRole",
      "sectionOrder",
      "headlineIds",
      "summary",
      "skillGroups",
      "positions",
      "projects",
      "keywordIds",
      "educationIds",
      "certificationIds",
      "courseIds",
      "rationale",
      "posting"
    ],
    properties: {
      targetRole: {
        type: "string",
        description:
          "The job title as the posting advertises it, written for this one " +
          "candidate rather than for every applicant: keep the posting's words, " +
          "but put the title in the candidate's grammatical gender and drop the " +
          "markers that are there only to address both. 'Desenvolvedor(a) Full " +
          "Stack' is 'Desenvolvedor Full Stack', 'Pessoa Desenvolvedora Backend' " +
          "is 'Desenvolvedor Backend', 'Analista de Dados (m/f)' is 'Analista de " +
          "Dados'. Nothing else about the title changes — not the level, not the " +
          "stack, not the wording. The only text in this answer that may come " +
          "from the posting."
      },
      sectionOrder: {
        type: "array",
        description:
          "The middle of the document, in reading order. The summary always " +
          "follows the header and the additional keywords always close the " +
          "document, so neither is listed here. Choose the order this posting " +
          "deserves rather than a habitual one: lead with whichever section " +
          "carries the strongest evidence for this job. Education, " +
          "certifications and languages are printed regardless, so leaving one " +
          "out only moves it to the end.",
        maxItems: MOVABLE.length,
        items: { type: "string", enum: [...MOVABLE] }
      },
      headlineIds: {
        ...idArray(
          "Ids from dsc.* and tec.*, ordered so the discipline and the technology " +
            "the posting is about come first. Drop the ones the posting has no use for."
        ),
        maxItems: facts.disciplines.length + facts.technologies.length
      },
      summary: {
        type: "array",
        description:
          "The professional summary, rewritten for this posting. Fewer, shorter " +
            "paragraphs are better; one is acceptable.",
        maxItems: facts.summary.length,
        items: rewrittenFact
      },
      skillGroups: {
        type: "array",
        description:
          "Skill groups worth printing, most relevant first. A group with nothing " +
            "the posting asks for should be left out entirely.",
        maxItems: facts.skillGroups.length,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "skillIds"],
          properties: {
            id: { type: "string", pattern: ID_PATTERN },
            skillIds: idArray("Skill ids kept from this group, most relevant first.")
          }
        }
      },
      positions: {
        type: "array",
        description:
          "Jobs, in the order given, which is reverse chronological. Keep that order: " +
            "a career is read as a timeline. Older or unrelated jobs may be kept with " +
            "fewer bullets, but never reordered and never merged.",
        maxItems: facts.positions.length,
        items: plannedEntry
      },
      projects: {
        type: "array",
        description: "Projects worth printing, most relevant to this posting first.",
        maxItems: facts.projects.length,
        items: plannedEntry
      },
      keywordIds: {
        ...idArray("Ids from kw.* that this posting makes relevant."),
        maxItems: facts.keywords.length
      },
      educationIds: {
        ...idArray(
          "Ids from edu.* worth printing. Leaving this empty keeps every degree, " +
            "so use it to drop a degree only when the posting makes it noise."
        ),
        maxItems: facts.education.length
      },
      certificationIds: {
        ...idArray(
          "Ids from cer.* this posting gives a reason to read. A certificate in " +
            "another field is a line that costs attention and earns none."
        ),
        maxItems: facts.certifications.length
      },
      courseIds: {
        ...idArray(
          "Ids from crs.* this posting gives a reason to read. These are short " +
            "courses: keep them only when they are on the subject of the job."
        ),
        maxItems: facts.courses.length
      },
      posting: {
        type: "object",
        additionalProperties: false,
        required: [
          "summary",
          "advertisedLevel",
          "actualLevel",
          "fit",
          "fitNote"
        ],
        description:
          "How you read this posting, for the salary step that follows. No money " +
          "here: what a job pays today is a fact about the world and is looked up " +
          "separately. Judge the job and the fit, which the posting and the facts " +
          "above are enough for.",
        properties: {
          summary: {
            type: "string",
            description:
              "The job in two or three lines, written to be searched with: level, " +
              "stack, domain, and — always — the COUNTRY whose market pays it, plus " +
              "remote or not. State the country even when the posting does not: a " +
              "posting written in Portuguese, with pay or benefits in reais, is the " +
              "Brazilian market unless it says otherwise, and a search that omits " +
              "this comes back with American figures for a Brazilian job. No company " +
              "story, no benefits, no adjectives — just what the work is and where."
          },
          advertisedLevel: {
            type: "string",
            description:
              "The level alone — 'júnior', 'pleno', 'sênior', 'staff' — as the " +
              "posting words it. Not the job title: 'Pessoa Desenvolvedora Backend " +
              "Sênior (Go)' is 'sênior'. Say 'não informado' when it states none."
          },
          actualLevel: {
            type: "string",
            description:
              "The level the responsibilities amount to. Price the work, not the " +
              "label: a posting advertised as mid-level that asks for architecture " +
              "decisions, production on-call or mentoring is a senior job advertised " +
              "cheaply. It holds downward too. Equal to advertisedLevel when they agree."
          },
          fit: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description:
              "How well this candidate matches what the job asks, from 0 to 100. It " +
              "doubles as the position of the ask inside the market band: 0 is the " +
              "floor of the band, 100 the ceiling. Be honest in both directions — a " +
              "specific, demonstrated match earns the top, a thin one does not, and " +
              "an ask above the band ends a screening rather than opening a " +
              "negotiation. Most real matches land between 40 and 80."
          },
          fitNote: {
            type: "string",
            description:
              "One line: what in this candidate's profile earns that number, and what " +
              "holds it back. Name the evidence, not adjectives."
          }
        }
      },
      rationale: {
        type: "string",
        description:
          "One or two sentences, in the language of the posting, on what was led " +
            "with and what was cut. Shown to the candidate, never printed on the sheet."
      }
    }
  };
}

/** The `text.format` object of the Responses API request. */
export function responseFormat(facts: CvFacts) {
  return {
    type: "json_schema" as const,
    name: "resume_plan",
    strict: true,
    schema: planSchema(facts)
  };
}
