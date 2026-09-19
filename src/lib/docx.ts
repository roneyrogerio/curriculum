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
import type { CV } from "../data/types";
import { headlineOf } from "./headline";

const FONT = "Calibri";
const BULLET = "ats-bullet";
const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
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

export function buildDocument(cv: CV): Document {
  const { labels, contact } = cv;

  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40, line: LINE_SPACING },
      children: [text(cv.name, { bold: true, size: 48 })]
    }),
    new Paragraph({
      spacing: { after: 40, line: LINE_SPACING },
      children: [text(cv.role, { bold: true, color: "0A7C72", size: 25 })]
    }),
    body(headlineOf(cv), { spacing: 60 }),
    body(
      [
        contact.email,
        contact.phone,
        contact.location,
        bare(contact.website),
        bare(contact.linkedin),
        bare(contact.github)
      ].join(" | "),
      { spacing: 120 }
    ),

    sectionHeading(labels.summary),
    ...cv.summary.map((paragraph) => body(paragraph)),

    sectionHeading(labels.skills),
    ...cv.skillGroups.map(
      (group) =>
        new Paragraph({
          spacing: { after: 60, line: LINE_SPACING },
          children: [
            text(`${group.title}: `, { bold: true }),
            text(`${group.skills.map((skill) => (skill.alias?.length ? `${skill.name} (${skill.alias.join(", ")})` : skill.name)).join(", ")}.`)
          ]
        })
    ),

    sectionHeading(labels.experience),
    ...cv.positions.flatMap((position) => [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 0, line: LINE_SPACING },
        keepNext: true,
        children: [text(`${position.title} — ${position.company}`, { bold: true, size: 23 })]
      }),
      new Paragraph({
        spacing: { after: 60, line: LINE_SPACING },
        keepNext: true,
        children: [
          text(`${position.start} – ${position.end} · ${position.employment} · ${position.location}`, {
            color: "5D666E"
          })
        ]
      }),
      ...position.highlights.map(bullet)
    ]),

    sectionHeading(labels.projects),
    ...cv.projects.flatMap((project) => [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 0, line: LINE_SPACING },
        keepNext: true,
        children: [text(project.name, { bold: true, size: 23 })]
      }),
      new Paragraph({
        spacing: { after: 60, line: LINE_SPACING },
        keepNext: true,
        children: (() => {
          const link = project.repository ?? project.url;
          const caption = project.repository ? labels.repository : labels.liveSite;
          if (!link) return [text(project.context, { color: "5D666E" })];
          // A real hyperlink, so the address is clickable in the document and
          // still readable as text when it is printed.
          return [
            text(`${project.context} · ${caption}: `, { color: "5D666E" }),
            new ExternalHyperlink({
              link,
              children: [
                new TextRun({
                  text: link.replace(/^https?:\/\//, ""),
                  style: "Hyperlink",
                  font: FONT,
                  size: 22
                })
              ]
            })
          ];
        })()
      }),
      ...project.highlights.map(bullet),
      body(`${project.stack.join(", ")}.`, { spacing: 40 })
    ]),
    body(cv.otherProjects),

    sectionHeading(labels.education),
    ...cv.education.map(
      (entry) =>
        new Paragraph({
          spacing: { after: 60, line: LINE_SPACING },
          children: [
            text(`${entry.degree}`, { bold: true }),
            text(` — ${entry.institution}, ${entry.period}${entry.note ? ` (${entry.note})` : ""}`)
          ]
        })
    ),

    sectionHeading(labels.certifications),
    ...cv.certifications.map(
      (certification) =>
        new Paragraph({
          spacing: { after: 60, line: LINE_SPACING },
          children: [
            text(certification.name, { bold: true }),
            text(
              ` — ${certification.issuer}, ${certification.issued}${
                certification.credentialId ? ` (ID ${certification.credentialId})` : ""
              }`
            )
          ]
        })
    ),
    new Paragraph({
      spacing: { before: 80, after: 60, line: LINE_SPACING },
      children: [
        text(`${labels.courses}: `, { bold: true }),
        text(`${cv.courses.map((course) => `${course.name} (${course.workload})`).join("; ")}.`)
      ]
    }),

    sectionHeading(labels.languages),
    ...cv.languages.map(
      (language) =>
        new Paragraph({
          spacing: { after: 60, line: LINE_SPACING },
          children: [text(language.name, { bold: true }), text(` — ${language.level}`)]
        })
    ),

    sectionHeading(labels.keywords),
    body(`${cv.keywords.join(", ")}.`)
  ];

  return new Document({
    creator: cv.name,
    title: cv.seoTitle,
    description: cv.seoDescription,
    keywords: cv.keywords.join(", "),
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


/** For the browser: the tailored document as a file the visitor can save. */
export async function docxBlob(cv: CV): Promise<Blob> {
  return await Packer.toBlob(buildDocument(cv));
}
