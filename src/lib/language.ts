/**
 * Guesses whether a job posting is written in Portuguese or English, so the
 * tailored CV comes out in the language the posting is in. Function words are
 * the signal: they are frequent, and they never overlap between the two.
 */
import type { Locale } from "../data/types";
import type { PostingLanguage } from "./resume/market/sources";

const MARKERS: Record<Locale, string[]> = {
  "pt-br": [
    "de","que","para","com","você","como","uma","nossa","nosso","pessoa","vaga","experiência",
    "conhecimento","desejável","requisitos","atividades","trabalhar","equipe","será","são","não"
  ],
  "en-us": [
    "the","and","you","with","for","our","we","are","will","have","experience","requirements",
    "responsibilities","team","role","skills","work","about","looking","strong"
  ]
};

export function detectLocale(text: string): Locale {
  const words = text
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

  const counts = { "pt-br": 0, "en-us": 0 } as Record<Locale, number>;
  for (const word of words) {
    for (const locale of Object.keys(MARKERS) as Locale[]) {
      if (MARKERS[locale].includes(word)) counts[locale] += 1;
    }
  }

  // Ties and empty input fall back to Portuguese, the site's default.
  return counts["en-us"] > counts["pt-br"] ? "en-us" : "pt-br";
}

/**
 * Which of three languages a posting is written in — for the market, not for
 * the document.
 *
 * Kept apart from `detectLocale` on purpose, because the two answer different
 * questions. `detectLocale` picks which of the two résumés to send, and there
 * are two: Portuguese and English. This picks where the job is likely to be,
 * and there Spanish matters even though no Spanish résumé exists: a posting
 * from Madrid or Buenos Aires is priced in its own market, and treating it as
 * Brazilian would be the same mistake that priced an English posting in reais.
 *
 * Spanish shares most of its function words with Portuguese, so the markers
 * are the ones that do not overlap: "y" against "e", "el" against "o", "los"
 * against "os". Counting "de" or "para" would make every Portuguese posting
 * look half Spanish.
 */
const SPANISH = [
  "y","el","los","las","del","al","años","trabajo","desarrollador","conocimientos",
  "puesto","búsqueda","nosotros","tus","además","también","requerimientos","deseable",
  "experiencia","actividades","empleo","sueldo","salarial","estamos","buscamos"
];

export function postingLanguage(text: string): PostingLanguage {
  const words = text
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

  let spanish = 0;
  for (const word of words) if (SPANISH.includes(word)) spanish += 1;

  const locale = detectLocale(text);

  /*
   * Spanish only wins against Portuguese, never against English: the markers
   * above are chosen to separate the two Iberian languages, and an English
   * posting that happens to contain "el" or "y" is still an English posting.
   */
  if (locale === "en-us") return "en";
  return spanish >= 4 ? "es" : "pt";
}
