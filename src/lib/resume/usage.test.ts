import { describe, expect, it, vi } from "vitest";
import { cvByLocale } from "../../data";
import { factsOf } from "./facts";
import { tailorResume } from "./index";

/*
 * O que uma geração custa, verificado em vez de afirmado.
 *
 * São três chamadas — triagem, adaptação e salário — e por um tempo o painel
 * mostrou os tokens de uma delas ao lado do preço das três. O número não
 * fechava com a conta, e ninguém tinha como notar: 8.000 tokens e quatro
 * centavos são os dois plausíveis, só não são a mesma geração.
 *
 * Este teste substitui a rede por três respostas gravadas, com contagens
 * distintas e reconhecíveis, e refaz a aritmética à mão a partir da tabela de
 * preços. Se alguma chamada sair do total, a soma deixa de bater.
 */

const cv = cvByLocale["pt-br"];
const facts = factsOf(cv);

/** Uma resposta da Responses API, com a contagem que este teste quer ver. */
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

/** Um plano que mantém tudo e não reescreve nada: passa pela verificação. */
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

/* Contagens distintas por chamada, para que uma omissão apareça na soma. */
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

/** A tabela de preços do `client.ts`, por milhão de tokens. */
const RATE = {
  nano: { input: 0.05, output: 0.4 },
  luna: { input: 0.2, output: 1.2 }
};

const priced = (usage: { input: number; cached: number; output: number }, rate: { input: number; output: number }) =>
  ((usage.input - usage.cached) * rate.input + usage.cached * (rate.input / 10) + usage.output * rate.output) / 1e6;

/*
 * Uma vaga diferente por teste, de propósito.
 *
 * A busca é guardada por uma semana com o anúncio como chave, então repetir o
 * mesmo texto acerta o cache e zera o custo da terceira chamada — que é o
 * comportamento certo e faria este arquivo medir outra coisa. A primeira
 * versão daqui repetiu, e a conta veio a US$ 0,0016 em vez de US$ 0,0181.
 */
let posting = 0;
const vaga = () =>
  `Vaga ${(posting += 1)}: pessoa desenvolvedora backend sênior em Go, remota, CLT, com Kubernetes.`;

describe("o que uma geração custa", () => {
  it("soma os tokens das três chamadas, e não os de uma", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );

    expect(result.usage.inputTokens).toBe(TRIAGE.input + TAILOR.input + MARKET.input);
    expect(result.usage.outputTokens).toBe(TRIAGE.output + TAILOR.output + MARKET.output);
    expect(result.usage.cachedTokens).toBe(TRIAGE.cached + TAILOR.cached + MARKET.cached);

    // A busca é o item mais caro da conta, e é o que a linha precisa dizer.
    expect(result.usage.searches).toBe(1);
  });

  it("cobra as três chamadas e a taxa por busca", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );

    const expected =
      priced(TRIAGE, RATE.nano) + priced(TAILOR, RATE.nano) + priced(MARKET, RATE.luna) + 1 * 0.01;

    expect(result.usage.usd).toBeCloseTo(expected, 10);
    // E a triagem, que é a barata, não some na soma por ser pequena.
    expect(result.usage.usd).toBeGreaterThan(priced(TAILOR, RATE.nano) + priced(MARKET, RATE.luna) + 0.01);
  });

  it("escreve o currículo no idioma que a triagem escolheu", async () => {
    const result = await tailorResume(
      { posting: vaga() },
      { apiKey: "k", fetch: stubbedFetch() as any }
    );
    expect(result.locale).toBe("pt-br");
    // E o cargo sai no gênero de quem assina, não no do anúncio.
    expect(result.document.head.role).toBe("Desenvolvedor Backend Sênior");
  });
});
