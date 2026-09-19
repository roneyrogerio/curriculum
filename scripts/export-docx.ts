/**
 * Writes the standard .docx for each locale. The document itself is built by
 * src/lib/docx.ts, which the browser also uses for tailored downloads.
 *
 * Usage: npm run export:docx
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Packer } from "docx";
import { allLocales, cvByLocale } from "../src/data/index.ts";
import { buildDocument } from "../src/lib/docx.ts";

const outputDir = join(resolve(import.meta.dirname, ".."), "public", "cv");

async function main() {
  await mkdir(outputDir, { recursive: true });

  for (const locale of allLocales) {
    const buffer = await Packer.toBuffer(buildDocument(cvByLocale[locale]));
    const name = `Roney-Oliveira-Software-Engineer-${locale.slice(-2).toUpperCase()}.docx`;
    await writeFile(join(outputDir, name), buffer);
    console.log(`DOCX gerado: public/cv/${name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
