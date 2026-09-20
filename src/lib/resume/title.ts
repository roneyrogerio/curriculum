/**
 * The advertised title, written for one candidate.
 *
 * A Brazilian posting advertises a job to everyone who might apply, so it
 * writes the title in both genders at once: "Desenvolvedor(a) Full Stack",
 * "Analista de Dados (m/f)", "Pessoa Desenvolvedora Backend". A résumé is
 * addressed by one person, and the same title has to land in that person's
 * gender — a sheet headed "Desenvolvedor(a)" is a job advertisement with a
 * name on it, not a candidate's claim to the job.
 *
 * The schema asks the model for the title already written this way, because
 * only the model can turn "Pessoa Desenvolvedora" into "Desenvolvedor": that
 * is a rewritten noun, not a trimmed marker. This is the net under it, for the
 * mechanical forms a model still echoes now and then — and it only ever
 * removes, so a title it does not recognise passes through untouched.
 */

/** "(m/f)", "(M/F/D)", "(o/a)", "(H/M)": a parenthesis that says only "both". */
const BOTH_GENDERS = /\s*\(\s*[mfhdoa](?:\s*[/x]\s*[mfhdoa])+\s*\)/gi;

/** "Desenvolvedor(a)", "Sócio (as)": the feminine ending, in parentheses. */
const PARENTHESISED_ENDING = /\s*\(\s*[oa]s?\s*\)/gi;

/** "Desenvolvedor/a", "Coordenador / as": the same marker with a slash. */
const SLASHED_ENDING = /(\p{L})\s*\/\s*[oa]s?\b/gu;

/**
 * The title as this candidate writes it: the posting's words, minus the
 * markers that are there only because the posting is addressed to everyone.
 */
export function titleForCandidate(title: string): string {
  return title
    .replace(BOTH_GENDERS, "")
    .replace(PARENTHESISED_ENDING, "")
    .replace(SLASHED_ENDING, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
