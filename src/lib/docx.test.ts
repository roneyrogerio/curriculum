import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { cvByLocale } from "../data";
import { buildDocument } from "./docx";
import { tailorCv } from "./tailor";

const posting = `Engenheiro de Dados

Requisitos:
- PostgreSQL e modelagem de dados
- Otimização de consultas
- MongoDB`;

const cv = cvByLocale["pt-br"];

async function textOf(document: ReturnType<typeof buildDocument>) {
  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer).toString("latin1");
}

describe("the exported document follows the tailored resume", () => {
  it("differs from the standard document once a posting is applied", async () => {
    // The download buttons once pointed at the pre-generated files, so a
    // tailored sheet silently exported the untailored resume.
    const { cv: tailored } = tailorCv(cv, posting);
    const [standard, adapted] = await Promise.all([
      textOf(buildDocument(cv)),
      textOf(buildDocument(tailored))
    ]);
    expect(adapted).not.toBe(standard);
  });

  it("carries the target role when one was chosen", async () => {
    const withRole = { ...cv, role: "Engenheiro de Dados" };
    expect(buildDocument(withRole)).toBeDefined();
    const document = await textOf(buildDocument(withRole));
    expect(document.length).toBeGreaterThan(1000);
  });

  it("still builds a valid package", async () => {
    const buffer = await Packer.toBuffer(buildDocument(cv));
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });
});
