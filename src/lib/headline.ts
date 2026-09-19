import type { CV, Term } from "../data/types";

/** "Go (Golang)": one item, every name it answers to. */
export function labelOfTerm(term: Term) {
  return term.alias?.length ? `${term.name} (${term.alias.join(", ")})` : term.name;
}

/** Every label a term answers to, for matching against a posting. */
export function labelsOfTerm(term: Term) {
  return [term.name, ...(term.alias ?? [])];
}

/**
 * The single line under the name. Built from the two lists rather than stored,
 * so a tailored ordering shows up here too instead of drifting from it.
 */
export function headlineOf(cv: CV) {
  return [...cv.disciplines, ...cv.technologies].map(labelOfTerm).join(" · ");
}
