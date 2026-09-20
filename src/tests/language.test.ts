import { describe, expect, it } from "vitest";
import { detectLocale, postingLanguage } from "../lib/language";

const BRAZILIAN = `Desenvolvedor Backend Sênior
Somos uma empresa de tecnologia e você vai trabalhar com a nossa equipe.
Requisitos: experiência com Go, conhecimento de Kubernetes, desejável Kafka.
Oferecemos vale-refeição, plano de saúde e home office.`;

const AMERICAN = `Senior Backend Engineer
We are looking for a strong engineer to join our team. You will work with Go
and Kubernetes. Requirements: experience with distributed systems.
We offer 401(k), unlimited PTO and remote work.`;

const SPANISH = `Desarrollador Backend Senior
Buscamos un desarrollador con experiencia en Go y Kubernetes para el equipo.
Requerimientos: conocimientos de sistemas distribuidos, 5 años en el puesto.
Ofrecemos trabajo remoto y además seguro médico. Nosotros somos una empresa
de tecnología y el puesto es para Madrid.`;

describe("which language a posting is written in", () => {
  it("tells the two the résumé exists in apart", () => {
    expect(detectLocale(BRAZILIAN)).toBe("pt-br");
    expect(detectLocale(AMERICAN)).toBe("en-us");
  });

  it("names the language the market is inferred from", () => {
    expect(postingLanguage(BRAZILIAN)).toBe("pt");
    expect(postingLanguage(AMERICAN)).toBe("en");
    expect(postingLanguage(SPANISH)).toBe("es");
  });

  it("does not read Spanish into a Portuguese posting", () => {
    // The two share most of their function words, so the markers are the ones
    // that do not overlap. Counting "de" or "para" would make every
    // Portuguese advertisement look half Spanish.
    expect(postingLanguage(BRAZILIAN)).toBe("pt");
  });

  it("does not read Spanish into an English posting", () => {
    const withStray = `${AMERICAN}\nOffices in El Paso and Los Angeles.`;
    expect(postingLanguage(withStray)).toBe("en");
  });

  it("falls back to Portuguese on nothing at all, like the site does", () => {
    expect(postingLanguage("")).toBe("pt");
  });
});
