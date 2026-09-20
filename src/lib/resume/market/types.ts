/**
 * What a salary lookup is about: one source's figures, and the answer built
 * from several of them.
 *
 * Kept apart from the call that fetches them and the arithmetic that combines
 * them, because these shapes are what the rest of the app reads — the panel
 * renders them, the tailoring pipeline passes them through — and none of that
 * should have to import a module that knows an HTTP endpoint.
 */
/**
 * The currencies a band may be quoted in: the one the job's own country pays
 * in, never a conversion of it.
 *
 * Nothing here converts between them any more. A salary is negotiated in the
 * currency of the country doing the hiring, and a panel that showed the same
 * figure in three currencies was showing two numbers nobody would ever say
 * out loud — at the cost of a daily call to the ECB and a rate that could
 * come back inverted.
 *
 * An enum rather than any three letters, because strict decoding then makes
 * an unformattable code impossible instead of a runtime error on the panel.
 * A market missing from this list is a market to add here.
 */
export const CURRENCIES = [
  "BRL",
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "MXN",
  "ARS",
  "CLP",
  "COP",
  "UYU",
  "ZAR",
  "INR",
  "SGD",
  "JPY",
  "AED"
] as const;

export type Currency = (typeof CURRENCIES)[number];

/** One source's published figures, copied rather than interpreted. */
export interface MarketObservation {
  /** The publication, and the page, so a figure can be traced to it. */
  title: string;
  url: string;
  /**
   * Whose figures these are: this employer's, or the market's.
   *
   * It decides how much the entry counts. What a named company actually pays
   * is evidence about this job; a national average is evidence about jobs like
   * it. Neither alone is the answer — a company that pays badly still pays
   * badly, and a candidate who only knows the national average walks into a
   * number nobody there has ever been offered.
   */
  scope: "company" | "market";
  /** The role and level that page's figures are for, in its own words. */
  role: string;
  level: string;
  min: number;
  median: number;
  max: number;
  currency: Currency;
  period: "month" | "year";
  regime: "CLT" | "PJ" | "não se aplica";
  /** When the data is from, as the page states it. */
  asOf: string;
}

export interface MarketSalary {
  min: number;
  /**
   * The middle of the market, which is what the ask should be read against.
   *
   * Without it the panel showed only a floor and a ceiling, and every figure
   * above the middle looked like it was pinned to the top — a band of 15k to
   * 18k with an ask of 17k reads as "almost the maximum" and as "the median
   * plus five hundred", and only one of those is true.
   */
  median: number;
  max: number;
  currency: Currency;
  period: "month" | "year";
  /** Whether the posting stated it, or it was found by searching. */
  source: "posting" | "search";
  /**
   * The contract the posting asks for, when it says.
   *
   * In Brazil this changes what a number means. A CLT salary carries the 13th,
   * a third of a month of holiday, FGTS and the employer's share; a PJ invoice
   * carries none of it, and is quoted higher for the same work. Comparing the
   * two gross figures without saying which is which is comparing nothing.
   */
  postingRegime: "CLT" | "PJ" | "não informado" | "não se aplica";
  /** Which of the two the figures above are quoted in. Salary guides publish
   *  CLT, so a band read from one is CLT unless the source says otherwise. */
  bandRegime: "CLT" | "PJ" | "não se aplica";
  /**
   * What the same work is worth as PJ, as a multiple of the CLT figure, in
   * this market and at this level. Returned rather than applied: the
   * conversion happens in the code, next to the factor that produced it.
   */
  pjOverClt: number;
  /** One line on what that multiple accounts for. */
  regimeNote: string;
  /** One line on what the figure rests on. */
  note: string;
  /**
   * What to ask for, decided here rather than computed.
   *
   * It was arithmetic once — the match score read as a position inside the
   * band — and it was wrong in a way that only showed on narrow bands: a 76%
   * match on a band of 15k to 18k came out at 17.28k, which is 720 short of
   * the ceiling. A formula cannot know whether a band is narrow or wide, in
   * demand or stagnant, or whether that employer pays above it. Whoever just
   * read the sources can.
   */
  ask: number;
  /** One line on why that figure, in negotiating terms. */
  askNote: string;
  /**
   * What each source actually published, before anything was averaged.
   *
   * This is the change that made the figure stop moving. Asked for a band, a
   * model reads four pages and answers with a number it formed while reading,
   * and forming a number is a judgement: the same four pages produced 12k on
   * one run and 17k on the next. Asked instead for what each page says, it is
   * copying rather than deciding — and the band is the median of the copies,
   * computed here. Arithmetic does not have a bad day.
   */
  observations: MarketObservation[];
  /**
   * What this employer pays, when the posting named one and anything was
   * found about it. Reported on its own as well as folded into the band
   * above, because the gap between the two is the negotiation: a company
   * below the market is a number to push on, and one above it is a reason
   * not to anchor on a national average.
   */
  companyBand: { min: number; median: number; max: number; used: number } | null;
  /** Every page consulted, so the number can be checked. */
  sources: { title: string; url: string }[];
  usage: { inputTokens: number; cachedTokens: number; outputTokens: number; searches: number };
}

export interface MarketQuery {
  /** The short brief the tailoring call wrote, not the advertisement. */
  summary: string;
  /**
   * The advertised job title and the country, as words rather than prose.
   *
   * The two searches are written from these, in code. Left to the model, the
   * terms came out differently on every run — and different terms are
   * different pages, which is different money: three lookups of one posting
   * came back at 16.500, 14.300 and 11.300 because one of them never opened a
   * page about the employer and another read a listing from another city.
   * Retrieval was the variance, not the arithmetic.
   */
  role: string;
  country: string;
  actualLevel: string;
  /** The employer, when the posting named one. */
  company: string;
  /** How well the candidate matched, from 0 to 100, and why. */
  fit: number;
  fitNote: string;
  /**
   * What identifies this lookup for caching: the posting itself.
   *
   * Not the summary. The summary is rewritten by the model on every run, so
   * two generations of the same advertisement produced two different keys and
   * the cache never hit — measured, twice in a row, at full price. The
   * posting is the thing that is actually the same.
   */
  cacheKey: string;
}
