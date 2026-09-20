import { enGb } from "./en-gb";
import { enUs } from "./en-us";
import { es } from "./es";
import { fr } from "./fr";
import { ptBr } from "./pt-br";
import { ptPt } from "./pt-pt";
import type { CV, Locale } from "./types";

/*
 * One file per language the markets actually advertise in, and no more.
 *
 * Spanish is one entry for Spain, Mexico, Argentina, Chile and Colombia: what
 * separates those CVs is personal data and structure, not the words a
 * technical résumé uses. Portuguese is two, because European Portuguese
 * differs in vocabulary a recruiter notices. English is two, because a British
 * advertisement asks for a CV and never for a resume. French is one, and it is
 * here for Quebec, where a local position generally requires it.
 *
 * German, Dutch and Polish are deliberately absent: tech hiring in those three
 * markets runs in English, so an English CV is what is expected there, and a
 * fourth and fifth translation to keep in sync would buy nothing.
 */
export const cvByLocale: Record<Locale, CV> = {
  "pt-br": ptBr,
  "pt-pt": ptPt,
  "en-us": enUs,
  "en-gb": enGb,
  es,
  fr
};

export const allLocales = Object.keys(cvByLocale) as Locale[];
