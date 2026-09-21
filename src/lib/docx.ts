/**
 * Builds the .docx for an applicant tracking system: single column, no tables,
 * no text boxes, nothing in the page header or footer, standard section
 * headings, a web-safe font and plain bullet lists.
 *
 * Kept free of Node APIs so the browser can build a tailored copy with the same
 * code that the export script writes to disk.
 */
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip
} from "docx";
import { absoluteHref } from "./links";
import type { Block, ResumeDocument } from "./resume/document";

const FONT = "Calibri";
const BULLET = "ats-bullet";
/** 1.15 line spacing: Word measures it in 1/20 pt, where single spacing is 240. */
const LINE_SPACING = 276;

function text(value: string, options: { bold?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({
    text: value,
    bold: options.bold,
    color: options.color,
    size: options.size ?? 22
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120, line: LINE_SPACING },
    border: { bottom: { style: "single", size: 6, color: "C9CFD4", space: 2 } },
    children: [text(title.toUpperCase(), { bold: true, color: "0A7C72", size: 26 })]
  });
}

function body(value: string, options: { spacing?: number } = {}) {
  return new Paragraph({
    spacing: { after: options.spacing ?? 70, line: LINE_SPACING },
    children: [text(value)]
  });
}

function bullet(value: string) {
  return new Paragraph({
    numbering: { reference: BULLET, level: 0 },
    spacing: { after: 40, line: LINE_SPACING },
    children: [text(value.replace(/`/g, ""))]
  });
}

/**
 * A real hyperlink, so the address is clickable in the document and still
 * readable as text once printed.
 */
function hyperlink(url: string, label?: string) {
  return new ExternalHyperlink({
    // Absolute, always: Word resolves a rooted path against the reader's own
    // disk, so the link lands on a file that never existed there.
    link: absoluteHref(url),
    children: [
      new TextRun({
        text: label ?? url.replace(/^https?:\/\//, ""),
        style: "Hyperlink",
        font: FONT,
        size: 22
      })
    ]
  });
}

/** Renders one block. The five kinds are the whole vocabulary of the sheet. */
function drawBlock(block: Block): Paragraph[] {
  switch (block.kind) {
    case "paragraphs":
      return block.items.map((paragraph) => body(paragraph));

    case "definitions":
      return block.items.map(
        (item) =>
          new Paragraph({
            spacing: { after: 60, line: LINE_SPACING },
            children: [text(`${item.term}: `, { bold: true }), text(item.description)]
          })
      );

    case "entries":
      return block.items.flatMap((entry) => [
        // A real heading style, not bold text that looks like one: a parser
        // segments the document by styles, and reads a styleless line as body.
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 140, after: 0, line: LINE_SPACING },
          keepNext: true,
          children: [
            text(entry.title, { bold: true, size: 23 }),
            ...(entry.org
              ? [
                  text(" — ", { bold: true, size: 23 }),
                  entry.org.href
                    ? hyperlink(entry.org.href, entry.org.text)
                    : text(entry.org.text, { bold: true, size: 23 })
                ]
              : [])
          ]
        }),
        ...(entry.meta || entry.link
          ? [
              new Paragraph({
                spacing: { after: 60, line: LINE_SPACING },
                keepNext: true,
                children: [
                  ...(entry.meta ? [text(entry.meta, { color: "5D666E" })] : []),
                  ...(entry.link
                    ? [
                        ...(entry.meta ? [text(" ", { color: "5D666E" })] : []),
                        // A real hyperlink, so the address is clickable in the
                        // document and still readable as text once printed.
                        new ExternalHyperlink({
                          link: entry.link,
                          children: [
                            new TextRun({
                              text: entry.link.replace(/^https?:\/\//, ""),
                              style: "Hyperlink",
                              font: FONT,
                              size: 22
                            })
                          ]
                        })
                      ]
                    : [])
                ]
              })
            ]
          : []),
        ...entry.bullets.map(bullet),
        ...(entry.tags.length ? [body(`${entry.tags.join(", ")}.`, { spacing: 40 })] : [])
      ]);

    case "lines":
      return block.items.map(
        (item) =>
          new Paragraph({
            spacing: { after: 60, line: LINE_SPACING },
            children: [
              ...(item.label ? [text(item.label, { bold: true }), text(" — ")] : []),
              text(item.text),
              ...(item.link ? [text(" · "), hyperlink(item.link.href, item.link.text)] : [])
            ]
          })
      );

    case "inline":
      return [body(block.text)];
  }
}

export function buildDocument(document: ResumeDocument): Document {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40, line: LINE_SPACING },
      children: [text(document.head.name, { bold: true, size: 48 })]
    }),
    new Paragraph({
      spacing: { after: 40, line: LINE_SPACING },
      children: [text(document.head.role, { bold: true, color: "0A7C72", size: 25 })]
    }),
    body(document.head.headline, { spacing: 60 }),
    /*
     * The contact line is a body paragraph, never a page header: Word headers
     * are a separate part of the file, and a parser that reads the document
     * body simply never sees them.
     */
    /*
     * Built run by run rather than joined into one string, because the e-mail
     * and the profiles have to stay clickable in the document.
     */
    new Paragraph({
      spacing: { after: 120, line: LINE_SPACING },
      children: document.head.contact.flatMap((item, index) => [
        ...(index > 0 ? [text(" | ")] : []),
        item.href ? hyperlink(item.href) : text(item.text)
      ])
    }),

    ...document.sections.flatMap((section) => [
      sectionHeading(section.heading),
      ...drawBlock(section.block),
      ...(section.note
        ? [
            new Paragraph({
              spacing: { before: 80, after: 60, line: LINE_SPACING },
              children: [text(section.note)]
            })
          ]
        : [])
    ])
  ];

  return new Document({
    creator: document.head.name,
    title: document.meta.title,
    description: document.meta.description,
    keywords: document.meta.keywords.join(", "),
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
          paragraph: { alignment: AlignmentType.LEFT, spacing: { line: LINE_SPACING } }
        },
        heading1: { run: { font: FONT, bold: true, color: "0A7C72", size: 26 } },
        heading2: { run: { font: FONT, bold: true, color: "16191C", size: 23 } }
      }
    },
    numbering: {
      config: [
        {
          reference: BULLET,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.17) }
                }
              }
            }
          ]
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75)
            }
          }
        },
        children
      }
    ]
  });
}


/** For the browser: the document as a file the visitor can save. */
export async function docxBlob(document: ResumeDocument): Promise<Blob> {
  return await Packer.toBlob(buildDocument(document));
}
