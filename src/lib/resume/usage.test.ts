import { describe, expect, it, vi } from "vitest";
import { cvByLocale } from "../../data";
import { factsOf } from "./facts";
import { tailorResume } from "./index";

/*
 * What a generation costs, verified rather than assumed.
 *
 * There are three calls — triage, tailoring, and salary — and for a time the
 * panel displayed the tokens of one beside the combined price of all three.
 * The numbers did not add up, and nobody could tell: 8,000 tokens and four
 * cents are both plausible, they just did not come from the same generation.
 *
 * This test replaces the network with three recorded responses having distinct,
 * recognizable token counts, and recalculates the arithmetic by hand using the
 * rate table. If any call is dropped from the total, the sum fails to match.
 */

const cv = cvByLocale["pt-br"];
const facts = factsOf(cv);

/** A response from the Responses API with the token counts this test expects. */
function reply(payload: unknown, usage: { input: number; cached: number; output: number }, extra: unknown[] = []) {
  return new Response(
    JSON.stringify({
      output: [
        ...extra,
        { type: "message", content: [{ type: "output_text", text: JSON.stringify(payload), annotations: [] }] }
      ],
      usage: {
        input_tokens: usage.input,
        input_tokens_details: { cached_tokens: usage.cached },
        output_tokens: usage.output
      }
    }),
    { status: 200 }
  );
}

const triage = {
  language: "pt-br",
  country: "Brasil",
  company: "Frete.com",
  advertisedLevel: "sênior",
  actualLevel: "sênior",
  regime: "CLT",
  summary: "Backend sênior em Go, logística, Brasil, remoto",
  declared: null
};

/** A plan that preserves everything and rewrites nothing: passes verification. */
const plan = {
  targetRole: "Desenvolvedor Backend Sênior",
  sectionOrder: ["skills", "experience", "projects", "education", "certifications", "languages"],
  headlineIds: facts.disciplines.concat(facts.technologies).map((fact) => fact.id),
  summary: facts.summary.map((fact) => ({ sourceId: fact.id, text: fact.text })),
  skillGroups: facts.skillGroups.map((group) => ({
    id: group.id,
    skillIds: group.skills.map((skill) => skill.id)
  })),
  positions: facts.positions.map((entry) => ({
    id: entry.id,
    bullets: entry.highlights.map((fact) => ({ sourceId: fact.id, text: fact.text }))
  })),
  projects: facts.projects.map((entry) => ({
    id: entry.id,
    bullets: entry.highlights.map((fact) => ({ sourceId: fact.id, text: fact.text }))
  })),
  keywordIds: facts.keywords.map((fact) => fact.id),
  educationIds: facts.education.map((fact) => fact.id),
  certificationIds: facts.certifications.map((fact) => fact.id),
  courseIds: facts.courses.map((fact) => fact.id),
  rationale: "manteve tudo",
  posting: { summary: "irrelevante", advertisedLevel: "sênior", actualLevel: "sênior", fit: 70, fitNote: "Go" }
};

const market = {
  min: 12_000,
  median: 15_000,
  max: 18_000,
  country: "Brasil",
  currency: "BRL",
  period: "month",
  source: "search",
  note: "dois guias",
  ask: 15_000,
  askNote: "na mediana",
  postingRegime: "CLT",
  bandRegime: "CLT",
  pjOverClt: 1.3,
  regimeNote: "cobre 13º e férias",
  observations: []
};

/* Distinct token counts per call, ensuring any omitted call shows up in the sum. */
const TRIAGE = { input: 1_000, cached: 0, output: 100 };
const TAILOR = { input: 8_000, cached: 2_000, output: 3_000 };
const MARKET = { input: 27_000, cached: 0, output: 900 };

function stubbedFetch() {
  return vi
    .fn()
    .mockResolvedValueOnce(reply(triage, TRIAGE))
    .mockResolvedValueOnce(reply(plan, TAILOR))
    .mockResolvedValueOnce(
      reply(market, MARKET, [{ type: "web_search_call", action: { sources: [] } }])
    );
}

/** The rate table from `client.ts`, per million tokens. */
const RATE = {
  nano: { input: 0.05, output: 0.4 },
  mini: { input: 0.25, output: 2.0 },
  luna: { input: 0.2, output: 1.2 },
  terra: { input: 2.0, output: 12.0 }
};

const priced = (usage: { input: number; cached: number; output: number }, rate: { input: number; output: number }) =>
  ((usage.input - usage.cached) * rate.input + usage.cached * (rate.input / 10) + usage.output * rate.output) / 1e6;

/*
 * A different posting per test, by design.
 *
 * Salary searches are cached for one week keyed by the posting text, so reusing
 * the same text hits the cache and zeroes the cost of the third call — which is
 * correct behavior, but would measure the wrong thing here. The initial version
 * did repeat it, and the bill came out to $0.0016 instead of $0.0181.
 */
let posting = 0;
const vaga = () =>
  `Vaga ${(posting += 1)}: pessoa desenvolvedora backend sênior em Go, remota, CLT, com Kubernetes.`;

describe("what a generation costs", () => {
  it("sums tokens across all three calls, not just one", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );

    expect(result.usage.inputTokens).toBe(TRIAGE.input + TAILOR.input + MARKET.input);
    expect(result.usage.outputTokens).toBe(TRIAGE.output + TAILOR.output + MARKET.output);
    expect(result.usage.cachedTokens).toBe(TRIAGE.cached + TAILOR.cached + MARKET.cached);

    // The search is the most expensive item on the bill, and the summary line must reflect it.
    expect(result.usage.searches).toBe(1);
  });

  it("charges for all three calls plus the search fee", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );

    const expected =
      priced(TRIAGE, RATE.nano) + priced(TAILOR, RATE.nano) + priced(MARKET, RATE.luna) + 1 * 0.01;

    expect(result.usage.usd).toBeCloseTo(expected, 10);
    // And triage, being the cheap call, does not get lost in the sum by being small.
    expect(result.usage.usd).toBeGreaterThan(priced(TAILOR, RATE.nano) + priced(MARKET, RATE.luna) + 0.01);
  });

  it("writes the résumé in the language selected by triage", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );
    expect(result.locale).toBe("pt-br");
    // And the job title adopts the candidate's grammatical gender, not the advertisement's.
    expect(result.document.head.role).toBe("Desenvolvedor Backend Sênior");
  });

  it("honours model overrides across each of the three calls and prices accordingly", async () => {
    const fetchImpl = stubbedFetch();
    const result = await tailorResume(
      {
        posting: vaga(),
        models: {
          triage: "gpt-5.6-luna",
          tailor: "gpt-5.6-terra",
          salary: "gpt-5-mini"
        }
      },
      { apiKey: "k", fetch: fetchImpl as any }
    );

    const calls = fetchImpl.mock.calls;
    expect(JSON.parse((calls[0] as any)[1].body).model).toBe("gpt-5.6-luna");
    expect(JSON.parse((calls[1] as any)[1].body).model).toBe("gpt-5.6-terra");
    expect(JSON.parse((calls[2] as any)[1].body).model).toBe("gpt-5-mini");

    const expected =
      priced(TRIAGE, RATE.luna) +
      priced(TAILOR, RATE.terra) +
      priced(MARKET, RATE.mini) +
      1 * 0.01;

    expect(result.usage.usd).toBeCloseTo(expected, 10);
    expect(result.usage.model).toBe("gpt-5.6-terra");
  });
});
