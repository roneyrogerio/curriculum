import { enUs } from "./en-us";
import { ptBr } from "./pt-br";
import type { CV, Locale } from "./types";

export const cvByLocale: Record<Locale, CV> = {
  "pt-br": ptBr,
  "en-us": enUs
};

export const allLocales = Object.keys(cvByLocale) as Locale[];
