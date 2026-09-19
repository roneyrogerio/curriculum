import { describe, expect, it } from "vitest";
import { allLocales, cvByLocale } from "./index";
import type { CV } from "./types";

const entries = allLocales.map((locale) => [locale, cvByLocale[locale]] as const);

describe.each(entries)("%s", (_locale, cv: CV) => {
  it("keeps every section populated", () => {
    // Guards against an edit silently dropping a whole block: this is exactly
    // how `otherProjects` and an education entry once disappeared unnoticed.
    expect(cv.summary.length).toBeGreaterThan(0);
    expect(cv.skillGroups.length).toBeGreaterThan(0);
    expect(cv.positions.length).toBeGreaterThan(0);
    expect(cv.projects.length).toBeGreaterThan(0);
    expect(cv.education.length).toBeGreaterThan(0);
    expect(cv.certifications.length).toBeGreaterThan(0);
    expect(cv.languages.length).toBeGreaterThan(0);
    expect(cv.keywords.length).toBeGreaterThan(0);
    expect(cv.otherProjects).toBeTruthy();
  });

  it("has no empty strings in rendered content", () => {
    const strings = [
      cv.name,
      cv.role,
      ...cv.disciplines.flatMap((term) => [term.name, ...(term.alias ?? [])]),
      ...cv.technologies.flatMap((term) => [term.name, ...(term.alias ?? [])]),
      cv.seoTitle,
      cv.seoDescription,
      ...cv.summary,
      ...cv.keywords,
      ...cv.positions.flatMap((p) => [p.title, p.company, p.location, p.start, p.end, ...p.highlights]),
      ...cv.projects.flatMap((p) => [p.name, p.context, ...p.stack, ...p.highlights])
    ];
    strings.forEach((value) => expect(value.trim()).not.toBe(""));
  });

  it("uses skill levels within the meter range", () => {
    cv.skillGroups.forEach((group) => {
      expect(group.skills.length).toBeGreaterThan(0);
      group.skills.forEach((skill) => {
        expect(skill.level).toBeGreaterThanOrEqual(1);
        expect(skill.level).toBeLessThanOrEqual(5);
        expect(Number.isInteger(skill.level)).toBe(true);
      });
    });
  });

  it("carries parseable ISO dates for every position", () => {
    cv.positions.forEach((position) => {
      expect(position.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(position.startDate))).toBe(false);
      if (position.endDate) {
        expect(position.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Date.parse(position.endDate)).toBeGreaterThan(Date.parse(position.startDate));
      }
    });
  });

  it("writes every date in one consistent format", () => {
    /*
     * Mixing "Jan 2019", "2019-01" and "jan/19" in one document makes parsers
     * miscalculate total tenure, which is how eight years of experience end up
     * indexed as three.
     */
    const shapes = new Set(
      cv.positions.flatMap((position) =>
        [position.start, position.end].map((value) =>
          value.replace(/\p{L}+/gu, "M").replace(/\d{4}/g, "Y")
        )
      )
    );
    expect([...shapes]).toHaveLength(1);
  });

  it("lists positions from most to least recent", () => {
    const starts = cv.positions.map((position) => Date.parse(position.startDate));
    expect([...starts].sort((a, b) => b - a)).toEqual(starts);
  });

  it("only exposes absolute, well-formed links", () => {
    const urls = [
      cv.contact.website,
      cv.contact.linkedin,
      cv.contact.github,
      cv.contact.whatsapp,
      ...cv.projects.flatMap((project) => [project.repository, project.url].filter(Boolean))
    ] as string[];
    urls.forEach((url) => expect(() => new URL(url)).not.toThrow());
    urls.forEach((url) => expect(url.startsWith("https://")).toBe(true));
  });

  it("gives every project a public link", () => {
    // A private repository must still be reachable through its live site.
    cv.projects.forEach((project) => {
      expect(project.repository ?? project.url).toBeTruthy();
    });
  });

  it("keeps the SEO description within the length search engines display", () => {
    expect(cv.seoDescription.length).toBeGreaterThan(70);
    expect(cv.seoDescription.length).toBeLessThanOrEqual(200);
    expect(cv.seoTitle.length).toBeLessThanOrEqual(75);
  });

  it("does not repeat keywords already spelled out in the skills section", () => {
    // Duplicates cost a printed page without adding parser signal, since the
    // skills section is weighted higher than a trailing keyword list.
    const skillText = cv.skillGroups
      .flatMap((group) => group.skills.flatMap((skill) => [skill.name, ...(skill.alias ?? [])]))
      .join(" | ")
      .toLowerCase();
    const duplicated = cv.keywords.filter((keyword) =>
      new RegExp(`(^|[^a-z])${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(skillText)
    );
    expect(duplicated).toEqual([]);
  });

  it("has unique keywords", () => {
    const lowered = cv.keywords.map((keyword) => keyword.toLowerCase());
    expect(new Set(lowered).size).toBe(lowered.length);
  });
});

describe("locale parity", () => {
  const [pt, en] = [cvByLocale["pt-br"], cvByLocale["en-us"]];

  it("describes the same career in both languages", () => {
    expect(pt.positions.length).toBe(en.positions.length);
    expect(pt.projects.length).toBe(en.projects.length);
    expect(pt.education.length).toBe(en.education.length);
    expect(pt.certifications.length).toBe(en.certifications.length);
    expect(pt.skillGroups.length).toBe(en.skillGroups.length);
  });

  it("keeps dates aligned and employers named the same across languages", () => {
    pt.positions.forEach((position, index) => {
      expect(position.startDate).toBe(en.positions[index].startDate);
      expect(position.endDate).toBe(en.positions[index].endDate);
    });
  });

  it("spells real employers identically, since they are proper nouns", () => {
    // Self-employment is described, not named, so it is translated on purpose.
    const employers = ["e-didatico", "Early Denver", "StutzLab"];
    employers.forEach((employer) => {
      expect(pt.positions.some((p) => p.company === employer)).toBe(true);
      expect(en.positions.some((p) => p.company === employer)).toBe(true);
    });
  });

  it("fills every label in both languages", () => {
    const ptKeys = Object.keys(pt.labels).sort();
    expect(Object.keys(en.labels).sort()).toEqual(ptKeys);
    ptKeys.forEach((key) => {
      expect(pt.labels[key as keyof typeof pt.labels].trim()).not.toBe("");
      expect(en.labels[key as keyof typeof en.labels].trim()).not.toBe("");
    });
  });
});
