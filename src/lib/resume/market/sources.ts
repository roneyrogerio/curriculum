/**
 * Which market pays a posting, and where that market's salaries are published.
 *
 * Two problems live here, and they are the same problem. The first: the lookup
 * used to search the open web, and the open web is why two readings of one
 * posting came back at 16.500 and 11.300 — one priced the job off a salary
 * guide, the next off a listing for another city. Restricting retrieval to a
 * named set is the one technique that fixes that without buying more searches;
 * a comparative study of retrieval-augmented models measured it at 8 to 18
 * points of accuracy and roughly half the run-to-run variance, with the
 * largest effect on the smaller models, which is the tier this runs on.
 *
 * The country is not decided here. Whoever read the posting is the model,
 * which had the employer, the currency, the benefits and the labour law in
 * front of it; this module has a table. There was a version where the code
 * checked that answer against the language of the text and threw it away when
 * the two disagreed — and a Brazilian posting with "estamos" and "buscamos"
 * in it was enough to be called Spanish. What happens here is the translation
 * of a country's name into a market: its currency, its timezone, and where
 * that market publishes salaries.
 *
 * Each market is its own entry even where two look alike. Canada is not the
 * United States: a senior developer there costs 25 to 30% less, CAD 120.000
 * lands near USD 90.000, and the sites that publish it are the .ca ones.
 * Folding the two together would have been one fewer entry and a 30% error.
 */

interface Market {
  /**
   * How to write this market's name. The key is normalised for lookup — no
   * accents, lower case — and that spelling must not reach a search term or a
   * prompt, where "polonia" and "mexico" read as typos.
   */
  name: string;
  /** ISO country code, for the search tool's own localisation. */
  code: string;
  timezone: string;
  /** What this market quotes salaries in, stated so the answer can be checked. */
  currency: string;
  /** What the model may answer with and mean this market. */
  aliases: string[];
  /**
   * Salary guides: a declared methodology, a sample and a date. These carry
   * the band, and compensation practice treats them as the benchmark that
   * crowdsourced figures supplement rather than replace.
   */
  guides: string[];
  /**
   * Employer-review and job sites. Self-reported and unverified, so not the
   * benchmark — but the only places a named company's own numbers appear, and
   * the company is 40% of the answer.
   */
  employers: string[];
}

/*
 * How this list was built, so the next person can judge it rather than trust
 * it.
 *
 * Every domain here was requested over HTTPS and answers: a 403 from a bot
 * wall counts as alive, a connection failure does not. That check alone
 * removed four entries that were written from memory and do not exist, and
 * six more that redirect out of their own market — roberthalf.com.br, .ca and
 * .co.uk all land on the American site, pagepersonnel.com.br is michaelpage
 * under another name, and hays.com.co is Hays Mexico.
 *
 * Liveness is not quality, and nothing here claims otherwise. The guides are
 * the ones named in comparative write-ups of salary benchmarking, preferring a
 * declared methodology — Robert Half surveys hiring managers and workers,
 * itjobswatch derives medians from advertised roles, nofluffjobs and justjoin
 * publish the range on every listing, Código Fonte's survey ran with 17 mil
 * respondents by level and stack.
 *
 * Two were dropped on evidence from this system's own output rather than on
 * reputation: salario.com.br and salarios.com.br publish an all-levels CAGED
 * average, and a measured run returned R$ 3.882 to R$ 4.541 from one of them
 * for a senior backend job. That is the whole reason the answer carries its
 * observations: the panel names every page a band was read off, so this list
 * is meant to be corrected from what it actually produces.
 */
/*
 * The keys are the lookup form: lower case, no accents, because that is what
 * `normalise` produces. The spelling meant for people is in `name`. A test
 * pins this, because an accented key here still works through the alias path
 * and breaks on any direct access.
 */
const MARKETS = {
  brasil: {
    name: "Brasil",
    code: "BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    aliases: ["brasil", "brazil", "br"],
    guides: [
      "roberthalf.com",
      "michaelpage.com.br",
      "hays.com.br",
      "pesquisa.codigofonte.com.br",
      "nagringa.dev"
    ],
    employers: ["glassdoor.com.br", "br.indeed.com", "linkedin.com", "vagas.com.br", "revelo.com.br"]
  },

  portugal: {
    name: "Portugal",
    code: "PT",
    timezone: "Europe/Lisbon",
    currency: "EUR",
    aliases: ["portugal", "pt"],
    guides: ["michaelpage.pt", "hays.pt", "landing.jobs", "germantechjobs.de"],
    employers: ["glassdoor.pt", "pt.indeed.com", "linkedin.com", "itjobs.pt"]
  },

  "estados unidos": {
    name: "Estados Unidos",
    code: "US",
    timezone: "America/New_York",
    currency: "USD",
    aliases: ["estados unidos", "eua", "united states", "usa", "us", "america"],
    guides: ["roberthalf.com", "salary.com", "builtin.com", "bls.gov", "survey.stackoverflow.co"],
    employers: ["levels.fyi", "glassdoor.com", "indeed.com", "linkedin.com"]
  },

  canada: {
    name: "Canadá",
    code: "CA",
    timezone: "America/Toronto",
    currency: "CAD",
    aliases: ["canada", "canadá"],
    // Its own market, not a cheaper United States: a senior developer costs
    // 25 to 30% less there, and CAD 120.000 lands near USD 90.000.
    guides: ["randstad.ca", "talent.com", "roberthalf.com", "survey.stackoverflow.co"],
    employers: ["levels.fyi", "glassdoor.ca", "ca.indeed.com", "linkedin.com"]
  },

  "reino unido": {
    name: "Reino Unido",
    code: "GB",
    timezone: "Europe/London",
    currency: "GBP",
    aliases: ["reino unido", "united kingdom", "uk", "inglaterra", "england", "gb"],
    guides: ["itjobswatch.co.uk", "hays.co.uk", "michaelpage.co.uk", "reed.co.uk", "germantechjobs.de"],
    employers: ["glassdoor.co.uk", "uk.indeed.com", "linkedin.com", "cwjobs.co.uk"]
  },

  irlanda: {
    name: "Irlanda",
    code: "IE",
    timezone: "Europe/Dublin",
    currency: "EUR",
    aliases: ["irlanda", "ireland", "ie"],
    guides: ["morganmckinley.com", "hays.ie", "cpl.com", "germantechjobs.de"],
    employers: ["glassdoor.ie", "ie.indeed.com", "linkedin.com", "irishjobs.ie"]
  },

  alemanha: {
    name: "Alemanha",
    code: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    aliases: ["alemanha", "germany", "deutschland", "de"],
    guides: ["gehalt.de", "stepstone.de", "germantechjobs.de", "michaelpage.de"],
    employers: ["glassdoor.de", "de.indeed.com", "linkedin.com", "kununu.com"]
  },

  espanha: {
    name: "Espanha",
    code: "ES",
    timezone: "Europe/Madrid",
    currency: "EUR",
    aliases: ["espanha", "españa", "spain", "es"],
    guides: ["michaelpage.es", "hays.es", "tecnoempleo.com", "germantechjobs.de"],
    employers: ["glassdoor.es", "es.indeed.com", "linkedin.com", "infojobs.net"]
  },

  "paises baixos": {
    name: "Países Baixos",
    code: "NL",
    timezone: "Europe/Amsterdam",
    currency: "EUR",
    aliases: ["países baixos", "paises baixos", "holanda", "netherlands", "nl"],
    guides: ["michaelpage.nl", "hays.nl", "germantechjobs.de"],
    employers: ["glassdoor.nl", "nl.indeed.com", "linkedin.com"]
  },

  polonia: {
    name: "Polônia",
    code: "PL",
    timezone: "Europe/Warsaw",
    currency: "PLN",
    aliases: ["polonia", "polônia", "poland", "pl"],
    // Both publish the advertised range on every listing, which is a band read
    // off the market rather than off a survey of volunteers.
    guides: ["nofluffjobs.com", "justjoin.it", "germantechjobs.de"],
    employers: ["glassdoor.pl", "pl.indeed.com", "linkedin.com", "pracuj.pl"]
  },

  mexico: {
    name: "México",
    code: "MX",
    timezone: "America/Mexico_City",
    currency: "MXN",
    aliases: ["mexico", "méxico", "mx"],
    guides: ["michaelpage.com.mx", "hays.com.mx", "occ.com.mx"],
    employers: ["glassdoor.com.mx", "mx.indeed.com", "linkedin.com", "computrabajo.com.mx"]
  },

  argentina: {
    name: "Argentina",
    code: "AR",
    timezone: "America/Argentina/Buenos_Aires",
    currency: "ARS",
    aliases: ["argentina", "ar"],
    // sysarmy's is the survey the local industry itself quotes.
    guides: ["sysarmy.com", "michaelpage.com.ar", "getonbrd.com"],
    employers: ["glassdoor.com.ar", "ar.indeed.com", "linkedin.com", "bumeran.com.ar"]
  },

  chile: {
    name: "Chile",
    code: "CL",
    timezone: "America/Santiago",
    currency: "CLP",
    aliases: ["chile", "cl"],
    guides: ["getonbrd.com", "michaelpage.cl", "randstad.cl"],
    employers: ["glassdoor.cl", "cl.indeed.com", "linkedin.com", "computrabajo.cl"]
  },

  colombia: {
    name: "Colômbia",
    code: "CO",
    timezone: "America/Bogota",
    currency: "COP",
    aliases: ["colombia", "colômbia", "co"],
    guides: ["getonbrd.com", "michaelpage.com.co", "computrabajo.com"],
    employers: ["glassdoor.com", "co.indeed.com", "linkedin.com", "computrabajo.com.co"]
  }
  /*
   * `satisfies` rather than a type annotation: annotating would erase the
   * literal keys, and with them the `MarketKey` type that the rest of the
   * module is checked against. This way the contract is verified entry by
   * entry and the keys stay a type.
   */
} satisfies Record<string, Market>;

/** Accents and case are noise: "España", "espanha" and "Spain" are one market. */
const normalise = (country: string) =>
  country
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type MarketKey = keyof typeof MARKETS;

const BY_ALIAS = new Map<string, MarketKey>(
  Object.entries(MARKETS).flatMap(([key, market]) =>
    [key, ...market.aliases].map((alias) => [normalise(alias), key as MarketKey] as const)
  )
);

export interface ResolvedMarket {
  /** The market's name, spelled as it should be written. */
  country: string;
  code: string;
  timezone: string;
  currency: string;
  guides: string[];
  employers: string[];
}

/**
 * The market to price this posting in.
 *
 * The country is whatever the model read: it saw the whole advertisement and
 * this module did not. All that happens here is the translation of that name
 * into a market — currency, timezone, and the sites where that market's
 * salaries are published.
 *
 * A country with no list of its own returns null, and the search falls back
 * to the open web: worse than a named list, and better than the wrong market.
 */
export function resolveMarket(country: string): ResolvedMarket | null {
  const named = BY_ALIAS.get(normalise(country));
  // A country with no sources of its own. The search falls back to the open
  // web, which is worse than a list and better than the wrong market.
  if (!named) return null;

  const market = MARKETS[named];
  return {
    country: market.name,
    code: market.code,
    timezone: market.timezone,
    currency: market.currency,
    guides: market.guides,
    employers: market.employers
  };
}

/**
 * The search tool, aimed at one market.
 *
 * Two settings, one purpose. `filters` decides which pages exist as far as
 * this lookup is concerned; `user_location` decides which of them a search
 * engine thinks are relevant, which is what keeps a Brazilian query off the
 * American results that are five times the figure.
 */
export function searchToolFor(market: ResolvedMarket | null) {
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

/** Exported for the tests that keep the list honest. */
export const KNOWN_MARKETS = Object.keys(MARKETS) as MarketKey[];
export const marketsByKey: Record<MarketKey, Market> = MARKETS;
