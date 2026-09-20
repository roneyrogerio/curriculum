/**
 * The band, as arithmetic over what the sources published.
 *
 * This is the file that made the figure stop moving between two runs of the
 * same posting. Asked for a band, a model reads four pages and answers with a
 * number it formed while reading — and forming a number is a judgement, so the
 * same four pages came back as 12k once and 17k the next time. Asked instead
 * for what each page says, it is copying; the band is then the median of the
 * copies, computed here, and arithmetic does not have a bad day.
 *
 * Nothing in this file knows about HTTP, OpenAI or Astro. It takes numbers and
 * returns numbers, which is why it is the part of the lookup that can be
 * tested without a key and without a network.
 */
import type { MarketObservation } from "./types";

/** A floor, a middle and a ceiling, in one currency and one period. */
interface Band {
  min: number;
  median: number;
  max: number;
}

/** A band with the kind of page it was read off still attached. */
type Figures = Band & { scope: MarketObservation["scope"]; url: string; asOf: string };

/**
 * The model's own reading of the market: the fallback band, and the currency,
 * period and regime everything else is brought into.
 */
interface Found {
  min: number;
  median: number;
  max: number;
  currency: string;
  period: string;
  bandRegime: string;
  pjOverClt: number;
}

/**
 * The middle value, with sources counted more than once where they weigh more.
 *
 * A weighted median rather than a weighted mean, because one page with a wild
 * figure should not drag the answer: a mean moves with every outlier, and the
 * outlier here is a salary guide quoting a different seniority under the same
 * job title. Repeating a value in the list is what "weighs double" means, and
 * it keeps the result a figure somebody actually published.
 */
function middle(entries: { value: number; weight: number }[]): number {
  const spread = entries.flatMap((entry) =>
    Array.from({ length: Math.max(1, Math.round(entry.weight)) }, () => entry.value)
  );
  const sorted = spread.sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}

/**
 * A source that is not about this level, thrown out before it can weigh in.
 *
 * Job titles are not levels. A search for a senior backend role returns pages
 * whose figures are for the whole career track, and one measured run pulled in
 * a guide quoting R$ 6.050 to R$ 8.000 against a band otherwise sitting near
 * R$ 15.000 — a junior's salary, filed under the same three words. Three
 * sources is a small enough sample that one of those decides the answer.
 *
 * The test is distance from the middle rather than anything read off the page,
 * because the page's own words for a level are exactly what was unreliable.
 * Half to double the middle is wide on purpose: it is here to drop a different
 * job, not to narrow a market that genuinely pays a wide range.
 */
function withoutOtherLevels<T extends { median: number }>(observations: T[]): T[] {
  if (observations.length < 3) return observations;

  const centre = middle(observations.map((item) => ({ value: item.median, weight: 1 })));
  const kept = observations.filter(
    (item) => item.median >= centre / 2 && item.median <= centre * 2
  );

  // Never filter down to something too thin to be a median: if that is what
  // the test leaves, the sample was the problem and the sample is what is used.
  return kept.length >= 2 ? kept : observations;
}

/**
 * How old a salary guide may be before it describes a different market.
 *
 * Two years, because one is too strict for guides published annually and late,
 * and three would have kept the 2020 edition that one measured run priced this
 * job off — against a 2025 edition on the next run, which is most of why the
 * two disagreed. The instructions already ask for recent sources; a page has
 * to be rejected rather than discouraged, because the model reads "prefira"
 * as advice and the arithmetic downstream cannot tell a stale figure from a
 * current one.
 */
const MAX_AGE_YEARS = 2;

/**
 * Sources old enough to be about another market, dropped.
 *
 * A page that does not say when its data is from is kept: the lookup cannot
 * date it, and refusing everything undated would throw out most job boards.
 * This filter is for the page that states a year and states an old one.
 */
function stillCurrent<T extends { asOf?: string }>(observations: T[]): T[] {
  const now = new Date().getFullYear();
  const fresh = observations.filter((item) => {
    const year = Number(/\b(19|20)\d{2}\b/.exec(item.asOf ?? "")?.[0]);
    return !Number.isFinite(year) || year >= now - MAX_AGE_YEARS;
  });

  // Same rule as everywhere here: a filter may not empty the sample. If every
  // source is old, an old band beats no band, and the dates are on the panel.
  return fresh.length >= 2 ? fresh : observations;
}

/**
 * One vote per publisher.
 *
 * Restricting the search to named sources fixed which pages could be read and
 * broke which pages were read: with the whole allowlist to choose from, the
 * model opened three Glassdoor pages and the band became three votes from one
 * publisher — stable, and stably wrong, because a self-reported aggregate is
 * one methodology no matter how many of its pages you open.
 *
 * Compensation practice is explicit about this. Crowdsourced figures
 * supplement structured surveys rather than replace them, and several sources
 * are blended at equal weight rather than counted. Equal weight is what this
 * gives them: the first reading from each publisher stands for that publisher,
 * and the rest of its pages say nothing new.
 *
 * Within a scope, so a company page on Glassdoor and a market page on
 * Glassdoor still both count — they are answering different questions.
 */
function oncePerPublisher<T extends { url?: string; scope?: string }>(observations: T[]): T[] {
  const seen = new Set<string>();
  return observations.filter((item) => {
    const key = `${item.scope ?? ""}\u0000${publisherOf(item.url ?? "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The registrable part of a host: glassdoor.com.br and its subdomains are one. */
function publisherOf(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    // Two labels, or three where the suffix itself has two (com.br, co.uk).
    const parts = host.split(".");
    const depth = parts.length > 2 && parts.at(-2)!.length <= 3 ? 3 : 2;
    return parts.slice(-depth).join(".");
  } catch {
    // Not a URL the lookup can attribute: treated as its own publisher rather
    // than silently merged with another.
    return url;
  }
}

/**
 * How much of the answer the named employer decides.
 *
 * The two kinds of source answer two different questions. A salary guide says
 * what the work is worth; a page about this company says what this company
 * pays for it, and that is where an offer will actually come from. Neither
 * alone is the answer, so the two bands are computed apart and blended — a
 * company that pays badly does not stop the market from being the argument
 * for asking more.
 *
 * It is a fixed share on purpose, and this is the correction of a real
 * mistake. Counting company pages double inside one median made the
 * employer's influence depend on how many pages the model happened to open:
 * three measured runs found zero, two and two, so the employer got 0%, then
 * two votes in five, then two in six, and the band moved between 16.500 and
 * 11.300 without anybody deciding anything. How much this employer counts is
 * a judgement about evidence, not a side effect of a search.
 */
const COMPANY_SHARE = 0.4;

/**
 * Salary figures are published to the hundred, not to the real. Rounding what
 * the arithmetic produces keeps two lookups that read the same sources from
 * differing by eleven reais and looking like they disagree.
 */
const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/**
 * The band, computed from what the sources published.
 *
 * Only the observations that are comparable are used: same currency, same
 * period, three figures that are actually numbers. A source quoted in the
 * other contract regime is converted with the multiple the model reported —
 * the one place a judgement enters, and it enters once, named, rather than
 * inside a number nobody can check.
 *
 * Two sources are the minimum worth trusting to arithmetic. Below that the
 * model's own reading is used, because the median of one source is that
 * source, and a single guide is not a market.
 */
export function bandOf(
  observations: MarketObservation[],
  found: Found
): Band & { used: number } {
  const comparable = figuresOf(observations, found);

  if (comparable.length < 2) {
    return { min: found.min, median: found.median, max: found.max, used: comparable.length };
  }

  const kept = oncePerPublisher(withoutOtherLevels(stillCurrent(comparable)));
  const step = found.period === "year" ? 1000 : 100;

  const market = kept.filter((item) => item.scope !== "company");
  const company = kept.filter((item) => item.scope === "company");

  // With only one kind of source there is nothing to blend, and the median of
  // everything is the answer. This is also the path for a posting that named
  // no employer, which is most of them.
  if (!market.length || !company.length) {
    return { ...ordered(medianOf(kept, step)), used: kept.length };
  }

  // Both kinds, so the employer gets its fixed share of the answer rather than
  // a number of votes that depends on how many of its pages turned up.
  const blended = blend(medianOf(market, step), medianOf(company, step), COMPANY_SHARE, step);
  return { ...ordered(blended), used: kept.length };
}

/**
 * The observations that can be compared with each other, in the band's own
 * currency, period and contract regime.
 */
function figuresOf(observations: MarketObservation[], found: Found): Figures[] {
  const factor = Number.isFinite(found.pjOverClt) && found.pjOverClt > 0 ? found.pjOverClt : 1;

  return observations
    .filter(
      (item) =>
        item &&
        item.currency === found.currency &&
        item.period === found.period &&
        [item.min, item.median, item.max].every((value) => Number.isFinite(value) && value > 0)
    )
    .map((item) => {
      // A page quoted in the other regime is brought into the band's own
      // before it can be compared with the rest.
      const scale =
        item.regime === found.bandRegime ||
        item.regime === "não se aplica" ||
        found.bandRegime === "não se aplica"
          ? 1
          : found.bandRegime === "CLT"
            ? 1 / factor
            : factor;
      // The three are sorted rather than trusted: a page that lists its
      // ceiling first is a formatting accident, not a different market.
      const [min, median, max] = [item.min, item.median, item.max]
        .map((value) => value * scale)
        .sort((a, b) => a - b);
      return { min, median, max, scope: item.scope, url: item.url, asOf: item.asOf };
    });
}

/** A three-figure band, as the column-by-column median of what came back. */
function medianOf(observations: Figures[], step: number): Band {
  const column = (pick: (item: Figures) => number) =>
    roundTo(middle(observations.map((item) => ({ value: pick(item), weight: 1 }))), step);
  return {
    min: column((item) => item.min),
    median: column((item) => item.median),
    max: column((item) => item.max)
  };
}

/** The two bands, at a fixed share each. */
function blend(market: Band, company: Band, share: number, step: number): Band {
  const mix = (a: number, b: number) => roundTo(a * (1 - share) + b * share, step);
  return {
    min: mix(market.min, company.min),
    median: mix(market.median, company.median),
    max: mix(market.max, company.max)
  };
}

/**
 * The three figures are computed a column at a time, so nothing guarantees
 * they come out in order; a band whose floor sits above its ceiling would
 * otherwise be printed as one.
 */
const ordered = (band: Band): Band => ({
  min: Math.min(band.min, band.median, band.max),
  median: Math.min(
    Math.max(band.median, Math.min(band.min, band.max)),
    Math.max(band.min, band.max)
  ),
  max: Math.max(band.min, band.median, band.max)
});

/**
 * What the named employer pays, on its own.
 *
 * One source is enough here, unlike the band: two salary guides disagreeing is
 * a market, but the single page about this company is all there is about this
 * company, and hiding it because it is alone would throw away the most
 * specific evidence in the answer.
 */
export function companyBandOf(
  observations: MarketObservation[],
  found: Found
): (Band & { used: number }) | null {
  const fromCompany = oncePerPublisher(
    figuresOf(observations, found).filter((item) => item.scope === "company")
  );
  if (!fromCompany.length) return null;

  const step = found.period === "year" ? 1000 : 100;
  return { ...ordered(medianOf(fromCompany, step)), used: fromCompany.length };
}
