export type Locale = "pt-br" | "en-us";

/**
 * One thing with more than one name. "Go" and "Golang" are the same skill, and
 * a posting may use either, so matching looks at every label while the document
 * shows them together.
 */
export interface Term {
  name: string;
  alias?: string[];
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
  /** The employer's site, so the name can be checked rather than taken. */
  companyUrl?: string;
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
  /**
   * The diploma, published under /certificados. The published image is a
   * redaction: the document states identity-card number, date and place of
   * birth, and those are painted out of the pixels before it is published.
   */
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  credentialId?: string;
  /** Where the credential can be checked. Printed, so it is checkable on paper. */
  url?: string;
}

export interface Course {
  name: string;
  /** Institution that issued it. */
  issuer: string;
  /** Hours, as the certificate states them. */
  workload: string;
  /** When it was taken, as the certificate states it. */
  period: string;
  /** The certificate itself, published under /certificados. */
  url?: string;
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
  /** Link text for a course's own certificate file. */
  certificate: string;
  /** Link text for the published diploma. */
  diploma: string;
  languages: string;
  links: string;
  keywords: string;
  targetRole: string;
  print: string;
  printAction: string;
  /** Link para a página privada de adaptação, na barra de impressão. */
  tailor: string;
  backToSite: string;
  repository: string;
  /**
   * Caption before a project's own address. Deliberately neutral: it labels
   * every project that has a site, and one of them is a game while another is
   * a recipe site.
   */
  liveSite: string;
  present: string;
  languageSwitch: string;
  skillLevel: string;
  printHint: string;
  themeLabel: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
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
   * The grammatical gender the candidate's own titles are written in.
   *
   * Portuguese job advertisements are addressed to everyone who might apply
   * and are written in both genders — "Desenvolvedor(a)", "Pessoa
   * Desenvolvedora". A résumé is written by one person, so the advertised
   * title has to be put back into a single gender, and that is a fact about
   * the candidate rather than a default worth hard-coding in a prompt. English
   * job titles carry no gender, so this has no effect there.
   */
  gender: "masculine" | "feminine";
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
  education: EducationEntry[];
  certifications: Certification[];
  courses: Course[];
  languages: LanguageSkill[];
  keywords: string[];
  labels: Labels;
}
