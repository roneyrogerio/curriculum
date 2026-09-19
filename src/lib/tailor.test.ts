import { describe, expect, it } from "vitest";
import { cvByLocale } from "../data";
import { tailorCv } from "./tailor";

const posting = `Pessoa Desenvolvedora Backend Sênior (Go)

Buscamos pessoa desenvolvedora backend para nossa plataforma de microsserviços em Go.
Requisitos:
- Go (Golang) em produção
- Kubernetes e Docker
- Terraform e infraestrutura como código
- gRPC, Kafka e Redis
- OpenTelemetry e observabilidade
`;

const cv = cvByLocale["pt-br"];
const { cv: tailored, report } = tailorCv(cv, posting);

const multiset = (values: string[]) => [...values].sort();

describe("tailorCv invents nothing", () => {
  it("returns exactly the same skills, only reordered", () => {
    const before = multiset(cv.skillGroups.flatMap((g) => g.skills.map((s) => s.name)));
    const after = multiset(tailored.skillGroups.flatMap((g) => g.skills.map((s) => s.name)));
    expect(after).toEqual(before);
  });

  it("keeps every skill's level and aliases untouched", () => {
    const index = new Map(cv.skillGroups.flatMap((g) => g.skills).map((s) => [s.name, s]));
    tailored.skillGroups
      .flatMap((g) => g.skills)
      .forEach((skill) => {
        const original = index.get(skill.name);
        expect(original).toBeDefined();
        expect(skill.level).toBe(original!.level);
        expect(skill.alias ?? []).toEqual(original!.alias ?? []);
      });
  });

  it("returns exactly the same bullets, only reordered", () => {
    const before = multiset(cv.positions.flatMap((p) => p.highlights));
    const after = multiset(tailored.positions.flatMap((p) => p.highlights));
    expect(after).toEqual(before);

    const projectsBefore = multiset(cv.projects.flatMap((p) => p.highlights));
    const projectsAfter = multiset(tailored.projects.flatMap((p) => p.highlights));
    expect(projectsAfter).toEqual(projectsBefore);
  });

  it("never introduces a word the posting has and the CV lacks", () => {
    const text = JSON.stringify(tailored).toLowerCase();
    ["grpc", "kafka", "redis", "opentelemetry"].forEach((absent) => {
      expect(text).not.toContain(absent);
    });
  });

  it("leaves untouched everything that is not a ranking decision", () => {
    expect(tailored.name).toBe(cv.name);
    expect(tailored.role).toBe(cv.role);
    expect(tailored.summary).toEqual(cv.summary);
    expect(tailored.education).toEqual(cv.education);
    expect(tailored.certifications).toEqual(cv.certifications);
    expect(tailored.languages).toEqual(cv.languages);
    expect(tailored.contact).toEqual(cv.contact);
  });

  it("keeps positions in chronological order, since dates are information", () => {
    expect(tailored.positions.map((p) => p.startDate)).toEqual(cv.positions.map((p) => p.startDate));
  });

  it("keeps the headline's own items, only reordered", () => {
    const names = (terms: { name: string }[]) => multiset(terms.map((term) => term.name));
    expect(names(tailored.disciplines)).toEqual(names(cv.disciplines));
    expect(names(tailored.technologies)).toEqual(names(cv.technologies));
  });

  it("keeps the same keywords, only reordered", () => {
    expect(multiset(tailored.keywords)).toEqual(multiset(cv.keywords));
  });
});

describe("tailorCv actually tailors", () => {
  it("promotes the skills the posting asks for", () => {
    const cloud = tailored.skillGroups.find((g) => g.title.includes("Dados"));
    const names = cloud!.skills.map((s) => s.name);
    expect(names.indexOf("Kubernetes")).toBeLessThan(names.indexOf("Prisma"));
    expect(names.indexOf("Docker")).toBeLessThan(names.indexOf("MongoDB"));
  });

  it("reports what the posting wants and the CV does not have", () => {
    const missing = report.missing.map((entry) => entry.term);
    expect(missing).toContain("grpc");
    expect(missing).toContain("kafka");
    expect(report.technicalCoverage).toBeGreaterThan(0);
    expect(report.technicalCoverage).toBeLessThan(100);
  });

  it("reports which skills it moved up", () => {
    expect(report.promoted.length).toBeGreaterThan(0);
  });
});

describe("the ordering follows the posting, not a fixed rule", () => {
  const frontend = `Frontend Engineer

Requisitos:
- React e TypeScript
- HTML e CSS
- Vite e Astro
- Interfaces responsivas`;

  const dados = `Engenheiro de Dados

Requisitos:
- PostgreSQL e modelagem de dados
- Otimização de consultas
- MongoDB
- BigQuery`;

  const first = (posting: string) => {
    const { cv } = tailorCv(cvByLocale["pt-br"], posting);
    return cv.skillGroups[0];
  };

  it("leads with the group the posting is about", () => {
    expect(first(frontend).title).toBe("Frontend");
    expect(first(dados).title).toBe("Dados e plataforma");
  });

  it("puts the asked-for skills at the top of their group", () => {
    const group = first(dados);
    const names = group.skills.map((skill) => skill.name);
    expect(names.slice(0, 4)).toEqual(
      expect.arrayContaining(["PostgreSQL", "Modelagem de dados", "Otimização de consultas"])
    );
    expect(names.indexOf("PostgreSQL")).toBeLessThan(names.indexOf("Docker"));
  });

  it("produces a different order for a different posting", () => {
    const a = tailorCv(cvByLocale["pt-br"], frontend).cv.skillGroups.map((g) => g.title);
    const b = tailorCv(cvByLocale["pt-br"], dados).cv.skillGroups.map((g) => g.title);
    expect(a).not.toEqual(b);
  });

  it("leaves the order untouched when the posting matches nothing", () => {
    const unrelated = "Requisitos:\n- Culinária francesa\n- Confeitaria";
    const { cv: tailored } = tailorCv(cvByLocale["pt-br"], unrelated);
    expect(tailored.skillGroups.map((g) => g.title)).toEqual(
      cvByLocale["pt-br"].skillGroups.map((g) => g.title)
    );
  });

  it("leads the headline with the discipline and technology asked for", () => {
    // The headline is the first line of the document, so a Go backend posting
    // must not open with "Frontend" just because that is the stored order.
    const go = tailorCv(cvByLocale["pt-br"], {
      title: "Software Engineer GO",
      description: "Requisitos:\n- Desenvolva software em Go\n- Microsservicos e APIs REST"
    }).cv;
    expect(go.technologies[0].name).toBe("Go");
    expect(go.disciplines[0].name).toBe("Backend");

    const front = tailorCv(cvByLocale["pt-br"], {
      title: "Frontend Engineer",
      description: "Requisitos:\n- React e TypeScript\n- HTML e CSS"
    }).cv;
    expect(front.disciplines[0].name).toBe("Frontend");
    expect(front.technologies[0].name).toBe("React");
  });

  it("only ever promotes a skill the posting actually names", () => {
    // A skill already at the top is not "promoted", so the invariant is not
    // which ones move, but that nothing moves up without the posting asking.
    const { report } = tailorCv(cvByLocale["pt-br"], dados);
    const text = dados.toLowerCase();
    report.promoted.forEach((name) => {
      const skill = cvByLocale["pt-br"].skillGroups
        .flatMap((group) => group.skills)
        .find((candidate) => candidate.name === name)!;
      const labels = [skill.name, ...(skill.alias ?? [])].map((label) => label.toLowerCase());
      expect(labels.some((label) => text.includes(label.split(" ")[0]))).toBe(true);
    });
    expect(report.promoted.length).toBeGreaterThan(0);
  });
});
