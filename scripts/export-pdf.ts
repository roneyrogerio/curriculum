/**
 * Writes the standard PDF for each locale, using the same builder the browser
 * runs for tailored downloads. One renderer means the two files cannot drift
 * apart in styling, and the export no longer needs a browser installed.
 *
 * Usage: npm run export:pdf
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { allLocales, cvByLocale } from "../src/data/index.ts";
import { buildPdf } from "../src/lib/pdf.ts";
import { documentOf } from "../src/lib/resume/index.ts";

const outputDir = join(resolve(import.meta.dirname, ".."), "public", "cv");

async function main() {
  await mkdir(outputDir, { recursive: true });

  for (const locale of allLocales) {
    const bytes = await buildPdf(documentOf(cvByLocale[locale]));
    const name = `Roney-Oliveira-Software-Engineer-${locale.slice(-2).toUpperCase()}.pdf`;
    await writeFile(join(outputDir, name), bytes);
    console.log(`PDF gerado: public/cv/${name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
