/**
 * Draws the resume as a real PDF in the browser.
 *
 * Text is written as text, never rasterised: a screenshot-based PDF carries no
 * text layer, and an applicant tracking system would read a blank page. The
 * metrics mirror src/styles/print.css so the downloaded file matches the sheet
 * on screen, and the base-14 fonts keep the file small without embedding.
 */
import { PDFDocument, type PDFFont, type PDFPage, PDFString, StandardFonts, rgb } from "pdf-lib";
import type { CV, Skill } from "../data/types";
import { headlineOf } from "./headline";

const MM = 72 / 25.4;
const PAGE = { width: 210 * MM, height: 297 * MM };
const MARGIN = 19 * MM;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;
const LEADING = 1.36;

const SIZE = {
  name: 20,
  role: 12.5,
  headline: 10,
  contact: 10,
  section: 13,
  entryTitle: 11.5,
  meta: 10,
  body: 11
};

const COLOR = {
  ink: rgb(0.086, 0.098, 0.11),
  soft: rgb(0.231, 0.259, 0.286),
  faint: rgb(0.365, 0.4, 0.431),
  accent: rgb(0.039, 0.486, 0.447),
  rule: rgb(0.788, 0.812, 0.831)
};

/** Base-14 fonts cover Latin-1; anything outside it is mapped to an equivalent. */
function sanitize(value: string) {
  return value
    .normalize("NFC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[→➔]/g, "->")
    .replace(/[✓✔]/g, "-")
    .replace(/μ/g, "µ")
    // Latin-1, plus the dashes and bullet that WinAnsi also carries. Dropping
    // them left "DevOps  Go" in the text layer, with the dash simply gone.
    .replace(/[^\u0020-\u00ff\u2013\u2014\u2022]/g, "");
}

interface Run {
  text: string;
  bold?: boolean;
  /** Turns the run into a clickable annotation, and colours it accordingly. */
  href?: string;
}

interface ParagraphOptions {
  size?: number;
  color?: ReturnType<typeof rgb>;
  indent?: number;
  bullet?: boolean;
  /** Extra room the first line needs, so a heading never ends a page alone. */
  keepWith?: number;
}

class Sheet {
  private page: PDFPage;
  private y: number;

  constructor(
    private readonly document: PDFDocument,
    private readonly regular: PDFFont,
    private readonly bold: PDFFont
  ) {
    this.page = document.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - MARGIN;
  }

  private fontFor(run: Run) {
    return run.bold ? this.bold : this.regular;
  }

  private ensure(height: number) {
    if (this.y - height >= MARGIN) return;
    this.page = this.document.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - MARGIN;
  }

  /** A real PDF link annotation, so the address is clickable in any reader. */
  private link(href: string, x: number, y: number, width: number, height: number) {
    const annotation = this.document.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y - 1, x + width, y + height],
      Border: [0, 0, 0],
      A: this.document.context.obj({ Type: "Action", S: "URI", URI: PDFString.of(href) })
    });
    this.page.node.addAnnot(this.document.context.register(annotation));
  }

  space(amount: number) {
    this.y -= amount;
  }

  rule(thickness: number, color = COLOR.rule) {
    this.ensure(thickness + 2);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + CONTENT_WIDTH, y: this.y },
      thickness,
      color
    });
    this.y -= thickness + 2;
  }

  /**
   * Lays out a sequence of runs, breaking lines on word boundaries and pages on
   * the bottom margin. Keeping mixed weights in one flow is what lets a line
   * read "Linguagens e frameworks: Go, TypeScript..." with only the label bold.
   */
  paragraph(runs: Run[], options: ParagraphOptions = {}) {
    const size = options.size ?? SIZE.body;
    const color = options.color ?? COLOR.soft;
    /*
     * A bold run inside body text is a label and gets the darker ink, but an
     * explicit colour must win: forcing ink on every bold run painted the
     * section headings black instead of the accent.
     */
    const emphasis = options.color ? color : COLOR.ink;
    const indent = options.indent ?? 0;
    const lineHeight = size * LEADING;
    const width = CONTENT_WIDTH - indent;

    interface Word {
      text: string;
      run: Run;
      width: number;
    }

    const words: Word[] = [];
    for (const run of runs) {
      for (const piece of sanitize(run.text).split(/(\s+)/)) {
        if (!piece) continue;
        words.push({ text: piece, run, width: this.fontFor(run).widthOfTextAtSize(piece, size) });
      }
    }

    let line: Word[] = [];
    let lineWidth = 0;
    let firstLine = true;

    const flush = () => {
      if (!line.length) return;
      this.ensure(lineHeight + (firstLine ? (options.keepWith ?? 0) : 0));

      let x = MARGIN + indent;
      if (options.bullet && firstLine) {
        this.page.drawText("•", {
          x: MARGIN + indent - 9,
          y: this.y - size,
          size: size * 0.9,
          font: this.bold,
          color
        });
      }
      /*
       * Adjacent words of the same weight are drawn as one string. Emitting a
       * separate text operation per word makes extractors treat every word as
       * its own line, which is how "Roney de Oliveira" reached a parser as
       * three lines instead of a name.
       */
      const sameStyle = (a: Run, b: Run) => a.bold === b.bold && a.href === b.href;

      let index = 0;
      while (index < line.length) {
        const run = line[index].run;
        let text = "";
        let runWidth = 0;
        while (index < line.length && sameStyle(line[index].run, run)) {
          text += line[index].text;
          runWidth += line[index].width;
          index += 1;
        }
        if (text.trim()) {
          this.page.drawText(text, {
            x,
            y: this.y - size,
            size,
            font: this.fontFor(run),
            color: run.href ? COLOR.accent : run.bold ? emphasis : color
          });
          if (run.href) this.link(run.href, x, this.y - size, runWidth, size);
        }
        x += runWidth;
      }

      this.y -= lineHeight;
      line = [];
      lineWidth = 0;
      firstLine = false;
    };

    for (const word of words) {
      const isSpace = !word.text.trim();
      if (isSpace && !line.length) continue;
      if (!isSpace && lineWidth + word.width > width && line.length) {
        while (line.length && !line[line.length - 1].text.trim()) line.pop();
        flush();
      }
      line.push(word);
      lineWidth += word.width;
    }
    flush();
  }

  heading(text: string) {
    this.ensure(SIZE.section * LEADING + SIZE.body * LEADING * 2);
    this.space(6);
    this.paragraph([{ text: text.toUpperCase(), bold: true }], {
      size: SIZE.section,
      color: COLOR.accent
    });
    this.rule(0.6);
    this.space(2);
  }

  async save() {
    return await this.document.save();
  }
}

const labelOf = (skill: Skill) =>
  skill.alias?.length ? `${skill.name} (${skill.alias.join(", ")})` : skill.name;

const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export async function buildPdf(cv: CV): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(cv.seoTitle);
  document.setAuthor(cv.name);
  document.setSubject(cv.seoDescription);
  document.setKeywords(cv.keywords);

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const sheet = new Sheet(document, regular, bold);
  const { labels, contact } = cv;

  sheet.paragraph([{ text: cv.name, bold: true }], { size: SIZE.name, color: COLOR.ink });
  sheet.paragraph([{ text: cv.role, bold: true }], { size: SIZE.role, color: COLOR.accent });
  sheet.paragraph([{ text: headlineOf(cv) }], { size: SIZE.headline });
  sheet.space(3);
  const separator = { text: "  |  " };
  sheet.paragraph(
    [
      { text: contact.email, href: `mailto:${contact.email}` },
      separator,
      { text: contact.phone },
      separator,
      { text: contact.location },
      separator,
      { text: bare(contact.website), href: contact.website },
      separator,
      { text: bare(contact.linkedin), href: contact.linkedin },
      separator,
      { text: bare(contact.github), href: contact.github }
    ],
    { size: SIZE.contact }
  );
  sheet.space(3);
  sheet.rule(1.6, COLOR.accent);

  sheet.heading(labels.summary);
  cv.summary.forEach((paragraph) => sheet.paragraph([{ text: paragraph }]));

  sheet.heading(labels.skills);
  cv.skillGroups.forEach((group) =>
    sheet.paragraph(
      [{ text: `${group.title}: `, bold: true }, { text: `${group.skills.map(labelOf).join(", ")}.` }],
      { keepWith: SIZE.body * LEADING }
    )
  );

  sheet.heading(labels.experience);
  cv.positions.forEach((position) => {
    sheet.space(4);
    sheet.paragraph([{ text: `${position.title} — ${position.company}`, bold: true }], {
      size: SIZE.entryTitle,
      color: COLOR.ink,
      keepWith: SIZE.body * LEADING * 2
    });
    sheet.paragraph(
      [
        {
          text: `${position.start} – ${position.end} · ${position.employment} · ${position.location}`
        }
      ],
      { size: SIZE.meta, color: COLOR.faint, keepWith: SIZE.body * LEADING }
    );
    position.highlights.forEach((highlight) =>
      sheet.paragraph([{ text: highlight }], { indent: 12, bullet: true })
    );
  });

  sheet.heading(labels.projects);
  cv.projects.forEach((project) => {
    sheet.space(4);
    sheet.paragraph([{ text: project.name, bold: true }], {
      size: SIZE.entryTitle,
      color: COLOR.ink,
      keepWith: SIZE.body * LEADING * 2
    });
    const source = project.repository ?? project.url;
    const caption = project.repository ? labels.repository : labels.liveSite;
    sheet.paragraph(
      source
        ? [{ text: `${project.context} · ${caption}: ` }, { text: bare(source), href: source }]
        : [{ text: project.context }],
      { size: SIZE.meta, color: COLOR.faint, keepWith: SIZE.body * LEADING }
    );
    project.highlights.forEach((highlight) =>
      sheet.paragraph([{ text: highlight.replace(/`/g, "") }], { indent: 12, bullet: true })
    );
    sheet.paragraph([{ text: `${project.stack.join(", ")}.` }], {
      size: SIZE.meta,
      color: COLOR.faint
    });
  });
  sheet.paragraph([{ text: cv.otherProjects }], { size: SIZE.meta, color: COLOR.faint });

  sheet.heading(labels.education);
  cv.education.forEach((entry) =>
    sheet.paragraph(
      [
        { text: entry.degree, bold: true },
        {
          text: ` — ${entry.institution}, ${entry.period}${entry.note ? ` (${entry.note})` : ""}`
        }
      ],
      { indent: 12, bullet: true }
    )
  );

  sheet.heading(labels.certifications);
  cv.certifications.forEach((certification) =>
    sheet.paragraph(
      [
        { text: certification.name, bold: true },
        {
          text: ` — ${certification.issuer}, ${certification.issued}${
            certification.credentialId ? ` (ID ${certification.credentialId})` : ""
          }`
        }
      ],
      { indent: 12, bullet: true }
    )
  );
  sheet.space(3);
  sheet.paragraph(
    [
      { text: `${labels.courses}: `, bold: true },
      { text: `${cv.courses.map((course) => `${course.name} (${course.workload})`).join("; ")}.` }
    ],
    { size: SIZE.meta, color: COLOR.faint }
  );

  sheet.heading(labels.languages);
  cv.languages.forEach((language) =>
    sheet.paragraph([{ text: language.name, bold: true }, { text: ` — ${language.level}` }], {
      indent: 12,
      bullet: true
    })
  );

  sheet.heading(labels.keywords);
  sheet.paragraph([{ text: `${cv.keywords.join(", ")}.` }], { size: SIZE.meta });

  return await sheet.save();
}
