/**
 * The rendered résumé, as typed blocks.
 *
 * The sheet used to be rendered straight from `CV`, which meant every renderer
 * knew what a "position" or a "certification" was. A rewritten résumé does not
 * have that shape: it keeps whichever sections survived the posting, in
 * whichever order suits it. So rendering is defined over a small set of block
 * kinds instead, and any document made of them prints correctly regardless of
 * what its text says.
 *
 * The kinds are deliberately few. Each one exists because an ATS parses it
 * differently, not because it looks different: a parser reads a definition list
 * and a bullet list as separate structures, and reads a heading as the start of
 * a section. Adding a sixth kind means having found a sixth thing a parser can
 * tell apart.
 */

/** Prose. The summary, and any standalone note. */
export interface ParagraphsBlock {
  kind: "paragraphs";
  items: string[];
}

/** "Term: description." How skill groups are read, as a definition list. */
export interface DefinitionsBlock {
  kind: "definitions";
  items: { term: string; description: string }[];
}

/**
 * A dated or attributed entry with bullets: a job, a project, a degree.
 * `meta` is one line because a parser reads date and role on the same line and
 * loses them when they sit in parallel columns.
 */
export interface EntriesBlock {
  kind: "entries";
  items: {
    title: string;
    /**
     * Who the work was for, kept apart from the role because they are two
     * facts and only one of them is a place someone can go and look at.
     */
    org: { text: string; href?: string } | null;
    meta: string | null;
    bullets: string[];
    /** Technologies, printed as a trailing line. Kept apart from the bullets
     *  so the same entry can be rendered without them on a tighter sheet. */
    tags: string[];
    link: string | null;
  }[];
}

/**
 * One line per item, each optionally led by a bold label and closed by a link.
 *
 * The link carries its own text so the line can end in a credential id rather
 * than in the address that proves it: the address is long enough to wrap, and
 * a wrapped URL costs a line of a résumé to say what the id already says.
 */
export interface LinesBlock {
  kind: "lines";
  items: {
    label: string | null;
    text: string;
    link: { text: string; href: string } | null;
  }[];
}

/** A single run of comma-separated text: keywords, a trailing note. */
export interface InlineBlock {
  kind: "inline";
  text: string;
}

export type Block = ParagraphsBlock | DefinitionsBlock | EntriesBlock | LinesBlock | InlineBlock;

/**
 * A section is a conventional heading plus one block. The heading is what an
 * ATS looks for to segment the document, which is why it is never decorative
 * and never optional.
 */
export interface Section {
  /**
   * A closing line of prose under the block. The résumé has two of these —
   * the other 42 projects, and the short courses — and both are a list too
   * minor to carry a heading and too real to drop.
   */
  note?: string | null;
  /** Which part of a résumé this is, independent of its heading's wording or
   *  its place in the list. The renderer ignores it; tests and the composer
   *  use it to talk about sections without relying on their order. */
  key: SectionKey;
  heading: string;
  block: Block;
}

/**
 * Every section a résumé here can have, and where each one is allowed to sit.
 *
 * A résumé is not a free arrangement of parts. Some of it is pinned, because a
 * reader and a parser both expect it in one place and putting it elsewhere
 * costs more than any relevance it could gain:
 *
 * - the head — name, headline, contact — is not a section at all, and is always
 *   first, because that is where a parser looks for how to contact someone;
 * - the summary comes directly under it. It is the one paragraph that is read
 *   in full, by people and by scoring alike, and a résumé that opens with a
 *   skills table has spent that position on a list;
 * - the additional keywords close the document. They exist to be matched, not
 *   read, and putting matter-for-machines above matter-for-people reads badly
 *   to the people.
 *
 * Everything between those is genuinely open, and that is where a posting gets
 * to decide: skills first for a stack-driven job, projects above employment
 * when the projects are the stronger evidence, education first for a role that
 * asks for a degree.
 *
 * The distinction is enforced in the schema rather than corrected afterwards:
 * the model is offered only the movable keys, so an invalid layout is not
 * something it can express.
 */
export const PINNED_FIRST = ["summary"] as const;

export const MOVABLE = [
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "courses",
  "languages"
] as const;

export const PINNED_LAST = ["keywords"] as const;

export const SECTION_KEYS = [...PINNED_FIRST, ...MOVABLE, ...PINNED_LAST] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
export type MovableKey = (typeof MOVABLE)[number];

/**
 * Printed whether or not the posting gives a reason to.
 *
 * An applicant tracking system scores a résumé down for having no education
 * section at all, and these three are three lines between them. Leaving them
 * to the model's judgement would trade a real scoring penalty for a saving of
 * nothing. The pinned sections are always printed too, by being pinned.
 */
export const ALWAYS_PRINTED = ["education", "certifications", "courses", "languages"] as const;

/**
 * The head of the document. Held apart from the sections because it is the one
 * part with no heading of its own, and because a parser expects the contact
 * details in the body's first lines rather than under a label.
 */
export interface DocumentHead {
  name: string;
  /** The target role. The most searched keyword in an ATS. */
  role: string;
  /** Disciplines and technologies, one line, already joined. */
  headline: string;
  /**
   * Email, phone, location and links, rendered separated by pipes. The href is
   * carried alongside the text because the exported PDF needs a real link
   * annotation, and the text printed there is the bare address.
   */
  contact: { text: string; href?: string }[];
}

/** What the exported file records about itself. */
export interface DocumentMeta {
  title: string;
  description: string;
  keywords: string[];
}

export interface ResumeDocument {
  locale: string;
  lang: string;
  head: DocumentHead;
  meta: DocumentMeta;
  sections: Section[];
}

/** Drops sections whose block carries nothing, so an empty heading never
 *  reaches the sheet and makes a parser open a section with no content. */
export function withoutEmptySections(document: ResumeDocument): ResumeDocument {
  return {
    ...document,
    // A section with nothing but a note still has something to say.
    sections: document.sections.filter((section) => !isEmpty(section.block) || !!section.note)
  };
}

export function isEmpty(block: Block): boolean {
  switch (block.kind) {
    case "inline":
      return block.text.trim().length === 0;
    case "entries":
      return block.items.length === 0;
    default:
      return block.items.length === 0;
  }
}

/** Every piece of text a block prints, for tests and for the ATS validator. */
export function textOfBlock(block: Block): string[] {
  switch (block.kind) {
    case "paragraphs":
      return block.items;
    case "definitions":
      return block.items.flatMap((item) => [item.term, item.description]);
    case "entries":
      return block.items.flatMap((item) =>
        [item.title, item.org?.text, item.meta, ...item.bullets, ...item.tags, item.link].filter(
          (value): value is string => typeof value === "string"
        )
      );
    case "lines":
      return block.items.flatMap((item) =>
        [item.label, item.text, item.link?.text].filter((v): v is string => !!v)
      );
    case "inline":
      return [block.text];
  }
}

export function textOfDocument(document: ResumeDocument): string[] {
  return [
    document.head.name,
    document.head.role,
    document.head.headline,
    ...document.head.contact.map((item) => item.text),
    ...document.sections.flatMap((section) =>
      [section.heading, ...textOfBlock(section.block), section.note].filter(
        (value): value is string => typeof value === "string"
      )
    )
  ];
}
