/**
 * Draws the résumé as a real PDF.
 *
 * Text is written as text, never rasterised: a screenshot-based PDF carries no
 * text layer, and an applicant tracking system would read a blank page. The
 * metrics mirror src/styles/print.css so the downloaded file matches the sheet
 * on screen, and the base-14 fonts keep the file small without embedding.
 */
import { PDFDocument, type PDFFont, type PDFPage, PDFString, StandardFonts, rgb } from "pdf-lib";
import type { Block, ResumeDocument } from "./resume/document";

const MM = 72 / 25.4;
const PAGE = { width: 210 * MM, height: 297 * MM };
const MARGIN = 19 * MM;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

/**
 * How much of the line the packer refuses to use.
 *
 * pdf-lib's metrics for the base-14 fonts do not agree to the last hundredth
 * with what a reader computes for the same glyphs — `b` measures 6.017pt here
 * and 6.116pt in pdf.js at 11pt — and over a full line the gap reached 3.4pt,
 * which is enough to push the last word past the paper while every text check
 * still passed, because clipped text stays in the text layer.
 *
 * So the line is packed to slightly less than the paper allows. The cost is a
 * few characters per line; the alternative is a résumé whose right edge is cut
 * off in print and correct on screen.
 */
const WRAP_SAFETY = 6;
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
    const width = CONTENT_WIDTH - indent - WRAP_SAFETY;

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

const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Draws one block. The five kinds are the whole vocabulary of the sheet. */
function drawBlock(sheet: Sheet, block: Block) {
  switch (block.kind) {
    case "paragraphs":
      block.items.forEach((paragraph) => sheet.paragraph([{ text: paragraph }]));
      return;

    case "definitions":
      block.items.forEach((item) =>
        sheet.paragraph([{ text: `${item.term}: `, bold: true }, { text: item.description }], {
          keepWith: SIZE.body * LEADING
        })
      );
      return;

    case "entries":
      block.items.forEach((entry) => {
        sheet.space(4);
        sheet.paragraph(
          [
            { text: entry.title, bold: true },
            ...(entry.org
              ? [
                  { text: " — ", bold: true },
                  { text: entry.org.text, bold: true, href: entry.org.href }
                ]
              : [])
          ],
          {
            size: SIZE.entryTitle,
            color: COLOR.ink,
            // Kept with what follows so a heading never ends a page alone.
            keepWith: SIZE.body * LEADING * 2
          }
        );
        if (entry.meta || entry.link) {
          sheet.paragraph(
            [
              ...(entry.meta ? [{ text: entry.meta }] : []),
              ...(entry.link
                ? [{ text: entry.meta ? " " : "" }, { text: bare(entry.link), href: entry.link }]
                : [])
            ],
            { size: SIZE.meta, color: COLOR.faint, keepWith: SIZE.body * LEADING }
          );
        }
        entry.bullets.forEach((bullet) =>
          // The backticks are markup for the screen; on paper they are noise.
          sheet.paragraph([{ text: bullet.replace(/`/g, "") }], { indent: 12, bullet: true })
        );
        if (entry.tags.length) {
          sheet.paragraph([{ text: `${entry.tags.join(", ")}.` }], {
            size: SIZE.meta,
            color: COLOR.faint
          });
        }
      });
      return;

    case "lines":
      block.items.forEach((item) =>
        sheet.paragraph(
          [
            ...(item.label ? [{ text: item.label, bold: true }, { text: " — " }] : []),
            { text: item.text },
            ...(item.link ? [{ text: " · " }, { text: item.link.text, href: item.link.href }] : [])
          ],
          { indent: 12, bullet: true }
        )
      );
      return;

    case "inline":
      sheet.paragraph([{ text: block.text }], { size: SIZE.meta });
  }
}

export async function buildPdf(document: ResumeDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(document.meta.title);
  pdf.setAuthor(document.head.name);
  pdf.setSubject(document.meta.description);
  pdf.setKeywords(document.meta.keywords);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const sheet = new Sheet(pdf, regular, bold);

  sheet.paragraph([{ text: document.head.name, bold: true }], {
    size: SIZE.name,
    color: COLOR.ink
  });
  sheet.paragraph([{ text: document.head.role, bold: true }], {
    size: SIZE.role,
    color: COLOR.accent
  });
  sheet.paragraph([{ text: document.head.headline }], { size: SIZE.headline });
  sheet.space(3);

  /*
   * The contact line sits in the body, never in a page header: a parser reads
   * the body and routinely ignores the margins, which is how a résumé arrives
   * with no way to answer it.
   */
  const separator = { text: "  |  " };
  sheet.paragraph(
    document.head.contact.flatMap((item, index) => [
      ...(index > 0 ? [separator] : []),
      { text: item.text, href: item.href }
    ]),
    { size: SIZE.contact }
  );
  sheet.space(3);
  sheet.rule(1.6, COLOR.accent);

  for (const section of document.sections) {
    sheet.heading(section.heading);
    drawBlock(sheet, section.block);
    if (section.note) {
      sheet.space(3);
      sheet.paragraph([{ text: section.note }], { size: SIZE.meta, color: COLOR.faint });
    }
  }

  return await sheet.save();
}
