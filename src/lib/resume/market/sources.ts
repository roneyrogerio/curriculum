/**
 * Where a salary may be looked up, and from where.
 *
 * The lookup used to search the open web, and the open web is why two readings
 * of one posting came back at 16.500 and 11.300: one run priced the job off a
 * salary guide, the next off a job board's listing for another city, a third
 * off an aggregator blog. The pages were different, so the answer was.
 *
 * Restricting retrieval to a named set is the one technique that addresses
 * this without buying more searches — a comparative study of retrieval-
 * augmented models measured it at 8 to 18 points of accuracy and roughly half
 * the run-to-run variance, with the largest effect on the smaller models, which
 * is the tier this lookup runs on. Domain filtering does not change what a
 * search costs, so this is precision for free.
 *
 * The list is per country because a salary source is per country: asking
 * Glassdoor Brasil about a job in Ohio is as wrong as asking levels.fyi about
 * a CLT salary in Goiânia. A country with no list here searches the open web,
 * which is what the whole lookup did before — worse, but never nothing.
 */

/** A market, and the pages that publish what it pays. */
interface Market {
  /** ISO country code, for the search tool's own localisation. */
  code: string;
  timezone: string;
  /**
   * Structured salary guides: a declared methodology, a sample and a date.
   * These carry the band, and compensation practice treats them as the
   * benchmark that crowdsourced figures supplement rather than replace.
   */
  guides: string[];
  /**
   * Employer-review and job sites. Self-reported and unverified, so they are
   * not the benchmark — but they are the only places a named company's own
   * numbers show up, and the company is 40% of the answer.
   */
  employers: string[];
}

const MARKETS: Record<string, Market> = {
  brasil: {
    code: "BR",
    timezone: "America/Sao_Paulo",
    guides: [
      "roberthalf.com.br",
      "michaelpage.com.br",
      "hays.com.br",
      "pagepersonnel.com.br",
      "salario.com.br",
      "salarios.com.br"
    ],
    employers: ["glassdoor.com.br", "br.indeed.com", "linkedin.com", "vagas.com.br", "catho.com.br"]
  },
  portugal: {
    code: "PT",
    timezone: "Europe/Lisbon",
    guides: ["michaelpage.pt", "hays.pt", "landing.jobs"],
    employers: ["glassdoor.pt", "pt.indeed.com", "linkedin.com", "net-empregos.com"]
  },
  "estados unidos": {
    code: "US",
    timezone: "America/New_York",
    guides: ["payscale.com", "salary.com", "roberthalf.com", "builtin.com"],
    employers: ["levels.fyi", "glassdoor.com", "indeed.com", "linkedin.com"]
  }
};

/** Matches on the country the plan named, which is one word by design. */
const marketOf = (country: string): Market | null =>
  MARKETS[country.trim().toLowerCase()] ?? null;

/**
 * The search tool, aimed at one market.
 *
 * Two settings, one purpose. `filters` decides which pages exist as far as
 * this lookup is concerned; `user_location` decides which of them a search
 * engine thinks are relevant, which is what keeps a Brazilian query off the
 * American results that are five times the figure.
 */
export function searchToolFor(country: string) {
  const market = marketOf(country);

  return {
    type: "web_search",
    // Enough of each page to read the figures off it, and no more: the pages a
    // search retrieves are billed as input tokens at the model's own rate.
    search_context_size: "medium",
    ...(market
      ? {
          filters: { allowed_domains: [...market.guides, ...market.employers] },
          user_location: { type: "approximate", country: market.code, timezone: market.timezone }
        }
      : {})
  };
}

/**
 * The sites to name in the message, so each of the two searches knows which
 * half of the list it is for: the band comes from the guides, the employer's
 * own figures from the job and review sites.
 */
export function sitesFor(country: string): { guides: string[]; employers: string[] } | null {
  const market = marketOf(country);
  return market ? { guides: market.guides, employers: market.employers } : null;
}

/** Exported for the test that keeps the list honest. */
export const KNOWN_MARKETS = Object.keys(MARKETS);
