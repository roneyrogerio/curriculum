/**
 * Simulates the resume parser pipeline that applicant tracking systems run —
 * text extraction, section segmentation, then field extraction — against the
 * generated PDF and DOCX, and reports what a parser would actually capture.
 *
 * Text is read in content-stream order, without sorting by position, because
 * that is what a naive extractor sees: it is the reading order that breaks on
 * multi-column layouts.
 *
 * Usage: npm run validate:ats
 */
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { allLocales, cvByLocale } from "../src/data/index.ts";
import { headlineOf } from "../src/lib/headline.ts";
import { inflateRawSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const cvDir = join(root, "public", "cv");

/*
 * Cada locale que existe, e não uma lista escrita aqui: um currículo novo que
 * ninguém valida é um currículo que só falha na frente de quem o recebeu.
 */
const locales = allLocales;

const expectations = {
  "pt-br": {
    sections: [
      "RESUMO PROFISSIONAL",
      "COMPETÊNCIAS TÉCNICAS",
      "EXPERIÊNCIA PROFISSIONAL",
      "PROJETOS",
      "FORMAÇÃO ACADÊMICA",
      "CERTIFICAÇÕES",
      "IDIOMAS"
    ],
    order: ["Roney de Oliveira", "RESUMO PROFISSIONAL", "EXPERIÊNCIA PROFISSIONAL", "FORMAÇÃO ACADÊMICA"],
    titles: ["Engenheiro de Software Sênior", "Engenheiro de Software Pleno", "Desenvolvedor Full Stack"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  },
  "pt-pt": {
    sections: [
      "RESUMO PROFISSIONAL",
      "COMPETÊNCIAS TÉCNICAS",
      "EXPERIÊNCIA PROFISSIONAL",
      "PROJETOS",
      "FORMAÇÃO ACADÉMICA",
      "CERTIFICAÇÕES",
      "IDIOMAS"
    ],
    order: ["Roney de Oliveira", "RESUMO PROFISSIONAL", "EXPERIÊNCIA PROFISSIONAL", "FORMAÇÃO ACADÉMICA"],
    titles: ["Engenheiro de Software Sénior", "Engenheiro de Software Intermédio", "Desenvolvedor Full Stack"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  },
  "en-gb": {
    sections: [
      "PROFESSIONAL SUMMARY",
      "TECHNICAL SKILLS",
      "PROFESSIONAL EXPERIENCE",
      "PROJECTS",
      "EDUCATION",
      "CERTIFICATIONS",
      "LANGUAGES"
    ],
    order: ["Roney de Oliveira", "PROFESSIONAL SUMMARY", "PROFESSIONAL EXPERIENCE", "EDUCATION"],
    titles: ["Senior Software Engineer", "Mid-Level Software Engineer", "Full Stack Developer"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  },
  fr: {
    sections: [
      "PROFIL PROFESSIONNEL",
      "COMPÉTENCES TECHNIQUES",
      "EXPÉRIENCE PROFESSIONNELLE",
      "PROJETS",
      "FORMATION",
      "CERTIFICATIONS",
      "LANGUES"
    ],
    order: ["Roney de Oliveira", "PROFIL PROFESSIONNEL", "EXPÉRIENCE PROFESSIONNELLE", "FORMATION"],
    titles: ["Ingénieur logiciel senior", "Ingénieur logiciel intermédiaire", "Développeur Full Stack"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  },
  es: {
    sections: [
      "RESUMEN PROFESIONAL",
      "COMPETENCIAS TÉCNICAS",
      "EXPERIENCIA PROFESIONAL",
      "PROYECTOS",
      "FORMACIÓN ACADÉMICA",
      "CERTIFICACIONES",
      "IDIOMAS"
    ],
    order: ["Roney de Oliveira", "RESUMEN PROFESIONAL", "EXPERIENCIA PROFESIONAL", "FORMACIÓN ACADÉMICA"],
    titles: ["Ingeniero de Software Sénior", "Ingeniero de Software Semisénior", "Desarrollador Full Stack"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  },
  "en-us": {
    sections: [
      "PROFESSIONAL SUMMARY",
      "TECHNICAL SKILLS",
      "PROFESSIONAL EXPERIENCE",
      "PROJECTS",
      "EDUCATION",
      "CERTIFICATIONS",
      "LANGUAGES"
    ],
    order: ["Roney de Oliveira", "PROFESSIONAL SUMMARY", "PROFESSIONAL EXPERIENCE", "EDUCATION"],
    titles: ["Senior Software Engineer", "Mid-Level Software Engineer", "Full Stack Developer"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Terraform", "AWS Lambda", "Knative"]
  }
};

const patterns = {
  email: /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
  phone: /\+\d{1,3}[\s-]?\d{2}[\s-]?\d{4,5}-?\d{4}/,
  linkedin: /linkedin\.com\/in\/[\w-]+/i,
  github: /github\.com\/[\w-]+/i,
  /** A date range a parser can turn into an employment period. */
  /*
   * `\p{L}` e não `\w`: os meses abreviados em francês trazem acento —
   * "août", "déc" —, e `\w` não casa com eles. A verificação passava a contar
   * cinco períodos onde havia oito, e a falha apontava para o currículo em vez
   * de apontar para esta linha.
   */
  dateRange: /(\p{L}{3,}\/?\s?\d{4})\s*[–-]\s*(\p{L}{3,}\/?\s?\d{4})/gu
};

/** A4 width and the page margin the print stylesheet declares, both in points. */
const A4_WIDTH_PT = (210 * 72) / 25.4;
const PAGE_MARGIN_PT = (19 * 72) / 25.4;
const overflowLimit = A4_WIDTH_PT - PAGE_MARGIN_PT + 1;

async function extractPdf(path: string) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(await readFile(path));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  const overflows = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    const lines = [];
    for (const item of content.items) {
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));

    /*
     * Text painted past the right margin is clipped on paper but still lands in
     * the text layer, so a parser check alone never sees it: a reader loses the
     * link while every field check still passes.
     */
    for (const item of content.items) {
      const right = item.transform[4] + (item.width ?? 0);
      if (right > overflowLimit) {
        overflows.push({ page: i, right, text: item.str.slice(0, 40) });
      }
    }
  }
  return { text: pages.join("\n"), pageCount: doc.numPages, overflows };
}

function unzip(buffer: Buffer) {
  const files = {};
  let offset = buffer.length - 22;
  while (offset > 0 && buffer.readUInt32LE(offset) !== 0x06054b50) offset -= 1;
  const count = buffer.readUInt16LE(offset + 10);
  let pointer = buffer.readUInt32LE(offset + 16);
  for (let i = 0; i < count; i += 1) {
    const nameLength = buffer.readUInt16LE(pointer + 28);
    const extraLength = buffer.readUInt16LE(pointer + 30);
    const commentLength = buffer.readUInt16LE(pointer + 32);
    const localOffset = buffer.readUInt32LE(pointer + 42);
    const name = buffer.toString("utf8", pointer + 46, pointer + 46 + nameLength);
    const method = buffer.readUInt16LE(localOffset + 8);
    const compressed = buffer.readUInt32LE(localOffset + 18);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(start, start + compressed);
    files[name] = method === 8 ? inflateRawSync(raw) : raw;
    pointer += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

async function extractDocx(path: string) {
  const files = unzip(await readFile(path));
  const xml = files["word/document.xml"].toString("utf8");
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [];
  const text = paragraphs
    .map((paragraph) =>
      [...paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((match) => match[1])
        .join("")
        /*
         * A entidade do apóstrofo faltava aqui, e a falta não parecia um erro
         * de extração: "children&#39;s" simplesmente não casava com o texto de
         * src/data, e a checagem acusava artefato desatualizado num arquivo
         * recém-gerado. Um leitor de .docx desescapa tudo; este também.
         */
        .replace(/&#3[49];|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
    )
    .filter((line) => line.trim())
    .join("\n");

  return {
    text,
    tables: (xml.match(/<w:tbl>/g) ?? []).length,
    textBoxes: (xml.match(/<w:txbxContent/g) ?? []).length,
    headings: (xml.match(/w:val="Heading\d"/g) ?? []).length,
    headerFooterParts: Object.keys(files).filter((name) => /header|footer/.test(name)).length
  };
}

const results: { label: string; passed: boolean; detail: string }[] = [];

function check(label: string, passed: boolean, detail = "") {
  results.push({ label, passed, detail });
  const mark = passed ? "  OK " : "  XX ";
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
}

function auditText(text: string, expected: any, source: string) {
  const compact = text.replace(/\s+/g, " ");

  check(`${source}: camada de texto extraída`, text.length > 2000, `${text.length} caracteres`);

  const email = compact.match(patterns.email);
  check(`${source}: e-mail`, Boolean(email), email?.[0] ?? "não encontrado");

  const phone = compact.match(patterns.phone);
  check(`${source}: telefone`, Boolean(phone), phone?.[0] ?? "não encontrado");

  const linkedin = compact.match(patterns.linkedin);
  check(`${source}: LinkedIn`, Boolean(linkedin), linkedin?.[0] ?? "não encontrado");

  const github = compact.match(patterns.github);
  check(`${source}: GitHub`, Boolean(github), github?.[0] ?? "não encontrado");

  const firstLine = text.split("\n").find((line) => line.trim());
  check(`${source}: nome na primeira linha`, firstLine?.trim() === "Roney de Oliveira", firstLine?.trim());

  const missingSections = expected.sections.filter((section) => !compact.includes(section));
  check(
    `${source}: seções padrão`,
    missingSections.length === 0,
    `${expected.sections.length - missingSections.length}/${expected.sections.length}` +
      (missingSections.length ? ` — faltam: ${missingSections.join(", ")}` : "")
  );

  const positions = expected.order.map((anchor) => compact.indexOf(anchor));
  const linear = positions.every((value, index) => value >= 0 && (index === 0 || value > positions[index - 1]));
  check(`${source}: ordem de leitura linear`, linear, linear ? "sem intercalação de colunas" : "fora de ordem");

  const missingTitles = expected.titles.filter((title) => !compact.includes(title));
  check(
    `${source}: cargos legíveis`,
    missingTitles.length === 0,
    `${expected.titles.length - missingTitles.length}/${expected.titles.length}`
  );

  const ranges = [...compact.matchAll(patterns.dateRange)];
  check(`${source}: períodos de emprego`, ranges.length >= 7, `${ranges.length} intervalos de data reconhecidos`);

  const foundSkills = expected.skills.filter((skill) => new RegExp(`\\b${skill}\\b`).test(compact));
  check(
    `${source}: competências recuperáveis`,
    foundSkills.length === expected.skills.length,
    `${foundSkills.length}/${expected.skills.length} na amostra`
  );

  /*
   * Custom symbols (checkmarks, arrows, stars) are the documented risk, not the
   * absence of a bullet: Chrome draws list markers outside the PDF text stream,
   * so a clean export legitimately carries none. What has to hold is that each
   * highlight stays on its own line instead of collapsing into one paragraph.
   */
  const exotic = text.match(/[\u2713\u2714\u27A2\u27A4\u2605\u2606\u25B6\u25CF\u25AA\u2192\u00BB]/g) ?? [];
  check(`${source}: sem símbolo exótico de marcador`, exotic.length === 0, `${exotic.length} encontrados`);

  /*
   * Os primeiros itens que o currículo deste locale realmente tem, lidos de
   * src/data em vez de escritos aqui. A versão anterior trazia as frases em
   * português e em inglês dentro da expressão regular, e um currículo em
   * espanhol reprovava sem ter nada de errado — a verificação é sobre a
   * quebra de linha, não sobre o idioma.
   */
  const openings = expected.openings as string[];
  const highlightLines = text
    .split("\n")
    // The bullet glyph sits in the same extracted line as its text, so it is
    // stripped before checking that the item starts a line of its own.
    .map((line) => line.trim().replace(/^[\u2022\u00b7\u2013\u2014-]+\s*/, ""))
    .filter((line) => openings.some((opening) => line.startsWith(opening)));
  check(
    `${source}: itens em linhas separadas`,
    highlightLines.length >= 1,
    `${highlightLines.length} itens iniciam a própria linha`
  );
}

/**
 * The PDF and DOCX are committed build outputs. Nothing else notices when the
 * data changes and `npm run export` is not re-run, so the stale file ships and
 * parses perfectly while contradicting the site.
 */
function auditFreshness(text: string, locale: keyof typeof cvByLocale, source: string) {
  const cv = cvByLocale[locale];
  /*
   * Compared with whitespace removed: the PDF text layer joins fragments
   * without always carrying the space between them, so spacing differences are
   * an artefact of extraction, not a difference in content.
   */
  const squeeze = (value: string) =>
    // NFKC also folds the micro sign onto Greek mu, which is how Chrome writes
    // it into the text layer.
    value.normalize("NFKC").replace(/\s+/g, "");
  const compact = squeeze(text);
  const required = [
    headlineOf(cv),
    ...cv.summary,
    ...cv.skillGroups.flatMap((group) => [group.title, ...group.skills.map((skill) => skill.name)]),
    ...cv.positions.flatMap((position) => [position.title, position.company, ...position.highlights]),
    ...cv.projects.flatMap((project) => [project.name, ...project.highlights]),
    ...cv.education.map((entry) => entry.degree),
    ...cv.certifications.map((certification) => certification.name),
    ...cv.languages.map((language) => language.name),
    ...cv.keywords
  ].map((value) => value.replace(/`/g, ""));
  const missing = required.filter((value) => !compact.includes(squeeze(value)));
  check(
    `${source}: artefato em dia com os dados`,
    missing.length === 0,
    missing.length ? `desatualizado, rode npm run export — falta: ${missing[0].slice(0, 60)}` : "confere com src/data"
  );
}

console.log("Simulação de parsing de ATS\n" + "=".repeat(60));

/** As primeiras palavras de cada item de experiência, vindas dos dados. */
function openingsOf(locale: keyof typeof cvByLocale): string[] {
  return cvByLocale[locale].positions
    .flatMap((position) => position.highlights.slice(0, 1))
    .map((highlight) => highlight.split(/[,:;.]/)[0].trim())
    .filter((opening) => opening.length > 12);
}

for (const locale of locales) {
  console.log(`\n### ${locale.toUpperCase()} — PDF`);
  const pdf = await extractPdf(join(cvDir, `Roney-Oliveira-Software-Engineer-${locale.slice(-2).toUpperCase()}.pdf`));
  /*
   * Informado, não exigido. Este é o currículo base, e ele é a fonte de fatos,
   * não o arquivo que se envia: quem vai para a vaga é a versão adaptada, que
   * o modelo encurta escolhendo o que aquela vaga tem motivo para ler. Um teto
   * de páginas aqui pressionaria a tirar um fato verdadeiro do repositório
   * justamente para caber numa folha que ninguém recebe.
   */
  console.log(`  --  PDF ${locale}: ${pdf.pageCount} páginas (sem limite, é o currículo base)`);
  check(
    `PDF ${locale}: nada ultrapassa a margem`,
    pdf.overflows.length === 0,
    pdf.overflows.length
      ? pdf.overflows
          .slice(0, 3)
          .map((o) => `p.${o.page} "${o.text}" termina em ${o.right.toFixed(1)}pt`)
          .join("; ")
      : `limite ${overflowLimit.toFixed(1)}pt respeitado`
  );
  auditText(pdf.text, { ...expectations[locale], openings: openingsOf(locale) }, `PDF ${locale}`);

  auditFreshness(pdf.text, locale, `PDF ${locale}`);

  console.log(`\n### ${locale.toUpperCase()} — DOCX`);
  const docx = await extractDocx(join(cvDir, `Roney-Oliveira-Software-Engineer-${locale.slice(-2).toUpperCase()}.docx`));
  check(`DOCX ${locale}: sem tabelas`, docx.tables === 0, `${docx.tables} tabelas`);
  check(`DOCX ${locale}: sem caixas de texto`, docx.textBoxes === 0, `${docx.textBoxes} caixas`);
  check(
    `DOCX ${locale}: nada em cabeçalho/rodapé`,
    docx.headerFooterParts === 0,
    `${docx.headerFooterParts} partes`
  );
  check(`DOCX ${locale}: estilos de título reais`, docx.headings >= 15, `${docx.headings} parágrafos com estilo Heading`);
  auditText(docx.text, { ...expectations[locale], openings: openingsOf(locale) }, `DOCX ${locale}`);
  auditFreshness(docx.text, locale, `DOCX ${locale}`);
}

const failed = results.filter((result) => !result.passed);
console.log("\n" + "=".repeat(60));
console.log(`${results.length - failed.length}/${results.length} verificações aprovadas`);

if (failed.length) {
  console.log("\nFalhas:");
  failed.forEach((result) => console.log(`  - ${result.label}: ${result.detail}`));
  process.exit(1);
}
