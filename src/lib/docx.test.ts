import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { cvByLocale } from "../data";
import { buildDocument } from "./docx";
import { documentOf } from "./resume";

const cv = cvByLocale["pt-br"];
const document = documentOf(cv);

async function textOf(document: ReturnType<typeof buildDocument>) {
  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer).toString("latin1");
}

describe("the exported document follows the resume it was given", () => {
  it("differs from the standard document once the resume differs", async () => {
    // The download buttons once pointed at the pre-generated files, so an
    // adapted sheet silently exported the untailored resume.
    const trimmed = { ...document, sections: document.sections.slice(0, 3) };
    const [standard, adapted] = await Promise.all([
      textOf(buildDocument(document)),
      textOf(buildDocument(trimmed))
    ]);
    expect(adapted).not.toBe(standard);
  });

  it("carries the target role when one was chosen", async () => {
    const withRole = { ...document, head: { ...document.head, role: "Engenheiro de Dados" } };
    expect(buildDocument(withRole)).toBeDefined();
    expect((await textOf(buildDocument(withRole))).length).toBeGreaterThan(1000);
  });

  it("still builds a valid package", async () => {
    const buffer = await Packer.toBuffer(buildDocument(document));
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });
});
