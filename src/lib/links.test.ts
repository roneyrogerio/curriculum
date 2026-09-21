/**
 * The invariant that was missing when seven links per language shipped dead.
 *
 * It is checked on the bytes both exporters actually write, not on the helper
 * alone: the helper being right and one of the two call sites not using it is
 * exactly the shape this defect had.
 */
import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";
import { inflateRawSync } from "node:zlib";
import { allLocales, cvByLocale } from "../data";
import { siteUrl } from "../data/site";
import { buildDocument } from "./docx";
import { absoluteHref } from "./links";
import { buildPdf } from "./pdf";
import { documentOf } from "./resume";

/** Every address a reader can click, read back out of the finished PDF. */
async function urisOfPdf(bytes: Uint8Array) {
  const pdf = await PDFDocument.load(bytes);
  const uris: string[] = [];
  for (const page of pdf.getPages()) {
    for (const reference of page.node.Annots()?.asArray() ?? []) {
      const annotation = pdf.context.lookup(reference) as PDFDict;
      const action = pdf.context.lookup(annotation.get(PDFName.of("A"))) as PDFDict | undefined;
      const uri = action?.get(PDFName.of("URI"));
      if (uri instanceof PDFString) uris.push(uri.asString());
    }
  }
  return uris;
}

/**
 * One file out of a .docx, which is a zip.
 *
 * Written out rather than pulled from a library because the assertion is
 * about bytes that leave this repository, and a zip reader is twenty lines:
 * the local header carries the name length at offset 26 and the extra length
 * at 28, and the entry is either stored or raw-deflated.
 */
function readZipEntry(zip: Buffer, name: string): string {
  const target = Buffer.from(name, "latin1");
  for (let at = 0; (at = zip.indexOf("PK\x03\x04", at, "latin1")) !== -1; at += 4) {
    const nameLength = zip.readUInt16LE(at + 26);
    const extraLength = zip.readUInt16LE(at + 28);
    if (!zip.subarray(at + 30, at + 30 + nameLength).equals(target)) continue;
    const start = at + 30 + nameLength + extraLength;
    const compressed = zip.readUInt16LE(at + 8) === 8;
    const body = zip.subarray(start);
    return (compressed ? inflateRawSync(body) : body).toString("utf8");
  }
  throw new Error(`no ${name} in this package`);
}

describe("absoluteHref", () => {
  it("gives a rooted path the site it belongs to", () => {
    expect(absoluteHref("/certificados/diploma.png")).toBe(`${siteUrl}/certificados/diploma.png`);
  });

  it("leaves alone what already names a host or needs none", () => {
    for (const href of [
      "https://www.coursera.org/account/accomplishments/certificate/M2EKXK59LHYI",
      "//example.com/x.pdf",
      "mailto:contact@roneyrogerio.dev",
      "tel:+5543991961524"
    ]) {
      expect(absoluteHref(href)).toBe(href);
    }
  });
});

describe("what the exported files link to", () => {
  it("writes no rooted path into any PDF, in any language", async () => {
    for (const locale of allLocales) {
      const uris = await urisOfPdf(await buildPdf(documentOf(cvByLocale[locale])));
      expect(uris.length).toBeGreaterThan(0);
      expect(uris.filter((uri) => uri.startsWith("/"))).toEqual([]);
      expect(uris).toContain(`${siteUrl}/certificados/diploma.png`);
    }
  });

  it("writes no rooted path into any DOCX, in any language", async () => {
    for (const locale of allLocales) {
      const buffer = Buffer.from(await Packer.toBuffer(buildDocument(documentOf(cvByLocale[locale]))));
      const targets = [...readZipEntry(buffer, "word/_rels/document.xml.rels").matchAll(/Target="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((target) => target.includes("certificados"));

      expect(targets.length).toBe(7);
      expect(targets.filter((target) => target.startsWith("/"))).toEqual([]);
      expect(targets).toContain(`${siteUrl}/certificados/diploma.png`);
    }
  });
});
