/**
 * Guesses whether a job posting is written in Portuguese or English, so the
 * tailored CV comes out in the language the posting is in. Function words are
 * the signal: they are frequent, and they never overlap between the two.
 */
import type { Locale } from "../data/types";

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
