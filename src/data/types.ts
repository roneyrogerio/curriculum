export type Locale = "pt-br" | "en-us";

/**
 * One thing with more than one name. "Go" and "Golang" are the same skill, and
 * a posting may use either, so matching looks at every label while the document
 * shows them together.
 */
export interface Term {
  name: string;
  alias?: string[];
  /**
   * Skills that demonstrate this term. A posting for a Go microservices job is
   * a backend job even when it never writes the word "backend", so a discipline
   * is ranked by what the posting demands, not by whether it names it.
   */
  evidence?: string[];
}

export interface Skill extends Term {
  /** 1 to 5. Shown as a meter on the site and omitted from the print version. */
  level: number;
}

export interface SkillGroup {
  title: string;
  skills: Skill[];
}

export interface Position {
  title: string;
  company: string;
  employment: string;
  start: string;
  end: string;
  /** ISO dates feeding JSON-LD and <time datetime>. */
  startDate: string;
  endDate?: string;
  location: string;
  highlights: string[];
}

export interface Project {
  name: string;
  context: string;
  repository?: string;
  url?: string;
  stack: string[];
  highlights: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  period: string;
  note?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  credentialId?: string;
}

export interface Course {
  name: string;
  workload: string;
}

export interface LanguageSkill {
  name: string;
  level: string;
}

export interface Labels {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  courses: string;
  languages: string;
  links: string;
  keywords: string;
  targetRole: string;
  print: string;
  printAction: string;
  backToSite: string;
  repository: string;
  liveSite: string;
  present: string;
  languageSwitch: string;
  skillLevel: string;
  printHint: string;
  themeLabel: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  tailorTitle: string;
  tailorHint: string;
  tailorPlaceholder: string;
  tailorApply: string;
  tailorReset: string;
  tailorCoverage: string;
  tailorPromoted: string;
  tailorMissing: string;
  tailorMissingHint: string;
  tailorNone: string;
  tailorSwitched: string;
  tailorGuarantee: string;
  tailorTitleUse: string;
  tailorTitleNote: string;
  tailorVerdict: string;
  tailorDownloadPdf: string;
  tailorDownloadDocx: string;
  tailorAdaptedBadge: string;
  tailorTitleField: string;
  tailorTitlePlaceholder: string;
  tailorOrder: string;
}

export interface Contact {
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  website: string;
  linkedin: string;
  github: string;
  location: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

export interface CV {
  locale: Locale;
  lang: string;
  hreflang: string;
  name: string;
  role: string;
  /**
   * The headline, kept as two lists so tailoring can lead with whichever
   * discipline and technology the posting is about. It sits at the very top of
   * the document, which is the highest-weighted place a keyword can be.
   */
  disciplines: Term[];
  technologies: Term[];
  seoTitle: string;
  seoDescription: string;
  summary: string[];
  contact: Contact;
  skillGroups: SkillGroup[];
  positions: Position[];
  projects: Project[];
  otherProjects: string;
  education: EducationEntry[];
  certifications: Certification[];
  courses: Course[];
  languages: LanguageSkill[];
  keywords: string[];
  labels: Labels;
}
