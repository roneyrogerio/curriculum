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
 * The second: a posting written in English came back priced as a Brazilian
 * job. No Brazilian advertisement is written in English, so that answer was
 * not a close call — it was a market the posting had ruled out, and the band
 * it produced was off by a multiple. The language of an advertisement is
 * evidence about where the job is, and `languages` here is what lets the code
 * refuse an answer that contradicts it.
 *
 * Each market is its own entry even where two look alike. Canada is not the
 * United States: a senior developer there costs 25 to 30% less, CAD 120.000
 * lands near USD 90.000, and the sites that publish it are the .ca ones.
 * Folding the two together would have been one fewer entry and a 30% error.
 */

/** The languages a posting can be recognised in. */
export type PostingLanguage = "pt" | "en" | "es";

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
  /**
   * The languages a posting for this market is plausibly written in.
   *
   * An advertisement for a job in Brazil is in Portuguese. One for a job in
   * Germany or the Netherlands is very often in English, because that is the
   * working language of the teams hiring. So this is a filter, not a label:
   * it rules a market out, it never rules one in.
   */
  languages: PostingLanguage[];
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
 * As chaves são o formulário de busca: minúsculas e sem acento, porque é nelas
 * que `normalise` cai. O nome que se escreve está em `name`. Um teste fixa
 * isso, porque uma chave acentuada aqui funciona pelo caminho do alias e
 * quebra em qualquer acesso direto — que é exatamente o que DEFAULT_MARKET faz.
 */
const MARKETS = {
  brasil: {
    name: "Brasil",
    code: "BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    languages: ["pt"],
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
    languages: ["pt", "en"],
    aliases: ["portugal", "pt"],
    guides: ["michaelpage.pt", "hays.pt", "landing.jobs", "germantechjobs.de"],
    employers: ["glassdoor.pt", "pt.indeed.com", "linkedin.com", "itjobs.pt"]
  },

  "estados unidos": {
    name: "Estados Unidos",
    code: "US",
    timezone: "America/New_York",
    currency: "USD",
    languages: ["en"],
    aliases: ["estados unidos", "eua", "united states", "usa", "us", "america"],
    guides: ["roberthalf.com", "salary.com", "builtin.com", "bls.gov", "survey.stackoverflow.co"],
    employers: ["levels.fyi", "glassdoor.com", "indeed.com", "linkedin.com"]
  },

  canada: {
    name: "Canadá",
    code: "CA",
    timezone: "America/Toronto",
    currency: "CAD",
    languages: ["en"],
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
    languages: ["en"],
    aliases: ["reino unido", "united kingdom", "uk", "inglaterra", "england", "gb"],
    guides: ["itjobswatch.co.uk", "hays.co.uk", "michaelpage.co.uk", "reed.co.uk", "germantechjobs.de"],
    employers: ["glassdoor.co.uk", "uk.indeed.com", "linkedin.com", "cwjobs.co.uk"]
  },

  irlanda: {
    name: "Irlanda",
    code: "IE",
    timezone: "Europe/Dublin",
    currency: "EUR",
    languages: ["en"],
    aliases: ["irlanda", "ireland", "ie"],
    guides: ["morganmckinley.com", "hays.ie", "cpl.com", "germantechjobs.de"],
    employers: ["glassdoor.ie", "ie.indeed.com", "linkedin.com", "irishjobs.ie"]
  },

  alemanha: {
    name: "Alemanha",
    code: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    languages: ["en"],
    aliases: ["alemanha", "germany", "deutschland", "de"],
    guides: ["gehalt.de", "stepstone.de", "germantechjobs.de", "michaelpage.de"],
    employers: ["glassdoor.de", "de.indeed.com", "linkedin.com", "kununu.com"]
  },

  espanha: {
    name: "Espanha",
    code: "ES",
    timezone: "Europe/Madrid",
    currency: "EUR",
    languages: ["es", "en"],
    aliases: ["espanha", "españa", "spain", "es"],
    guides: ["michaelpage.es", "hays.es", "tecnoempleo.com", "germantechjobs.de"],
    employers: ["glassdoor.es", "es.indeed.com", "linkedin.com", "infojobs.net"]
  },

  "paises baixos": {
    name: "Países Baixos",
    code: "NL",
    timezone: "Europe/Amsterdam",
    currency: "EUR",
    languages: ["en"],
    aliases: ["países baixos", "paises baixos", "holanda", "netherlands", "nl"],
    guides: ["michaelpage.nl", "hays.nl", "germantechjobs.de"],
    employers: ["glassdoor.nl", "nl.indeed.com", "linkedin.com"]
  },

  polonia: {
    name: "Polônia",
    code: "PL",
    timezone: "Europe/Warsaw",
    currency: "PLN",
    languages: ["en"],
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
    languages: ["es", "en"],
    aliases: ["mexico", "méxico", "mx"],
    guides: ["michaelpage.com.mx", "hays.com.mx", "occ.com.mx"],
    employers: ["glassdoor.com.mx", "mx.indeed.com", "linkedin.com", "computrabajo.com.mx"]
  },

  argentina: {
    name: "Argentina",
    code: "AR",
    timezone: "America/Argentina/Buenos_Aires",
    currency: "ARS",
    languages: ["es", "en"],
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
    languages: ["es", "en"],
    aliases: ["chile", "cl"],
    guides: ["getonbrd.com", "michaelpage.cl", "randstad.cl"],
    employers: ["glassdoor.cl", "cl.indeed.com", "linkedin.com", "computrabajo.cl"]
  },

  colombia: {
    name: "Colômbia",
    code: "CO",
    timezone: "America/Bogota",
    currency: "COP",
    languages: ["es", "en"],
    aliases: ["colombia", "colômbia", "co"],
    guides: ["getonbrd.com", "michaelpage.com.co", "computrabajo.com"],
    employers: ["glassdoor.com", "co.indeed.com", "linkedin.com", "computrabajo.com.co"]
  }
  /*
   * `satisfies`, e não uma anotação de tipo: anotar apagaria as chaves
   * literais, e com elas o MarketKey que impede DEFAULT_MARKET de apontar
   * para um mercado que não existe. Assim o contrato é verificado item a
   * item e as chaves continuam sendo um tipo.
   */
} satisfies Record<string, Market>;

/**
 * Where a posting in this language is, when nothing else says.
 *
 * A default, not a guess dressed as one: it is only reached when the market
 * the model named is one this language rules out, and searching the wrong
 * country's sites is worse than searching the likeliest one.
 */
/**
 * Chaves de MARKETS, não nomes de país: são usadas em acesso direto, então um
 * "Estados Unidos" escrito aqui devolveria undefined em silêncio. O tipo
 * abaixo transforma esse erro em erro de compilação.
 */
const DEFAULT_MARKET: Record<PostingLanguage, MarketKey> = {
  pt: "brasil",
  en: "estados unidos",
  es: "espanha"
};

/**
 * Respostas que não são um país.
 *
 * O campo é texto livre, e o modelo devolve isto quando o anúncio não diz onde
 * a vaga é — o que é comum em vaga remota. Tratá-las como país tinha dois
 * efeitos, os dois ruins: o termo de busca saía "salário ... não informado
 * 2026", e a tela dizia "Mercado: não informado" sobre uma busca que mesmo
 * assim aconteceu, em algum mercado, sem dizer qual. Aqui elas viram o que
 * são: ausência de resposta, respondida pelo padrão do idioma.
 *
 * Um país de verdade que não está na lista — Japão, Índia, Suécia — não entra
 * aqui: ele é mantido, e a busca é na web aberta. Trocá-lo pelo padrão do
 * idioma seria precificar uma vaga japonesa no mercado americano.
 */
const UNSTATED = [
  "nao informado",
  "nao declarado",
  "nao especificado",
  "desconhecido",
  "remoto",
  "remote",
  "global",
  "mundial",
  "worldwide",
  "internacional",
  "international",
  "europa",
  "europe",
  "america latina",
  "latam",
  "n/a",
  "na",
  "-"
];

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

/**
 * De onde veio o mercado que está sendo usado.
 *
 * Os três não valem o mesmo e a tela não pode mostrá-los igual. "read" é o
 * país declarado no anúncio. Os outros dois são o padrão do idioma, que
 * acerta a maioria e erra um anúncio britânico por um múltiplo — então quem
 * confere precisa ver que está olhando um padrão, e por qual dos dois motivos.
 */
export type MarketOrigin =
  /** O anúncio declarou o país, e ele tem lista de fontes. */
  | "read"
  /** O anúncio não declarou país nenhum: "não informado", "remoto", "Europa". */
  | "unstated"
  /** Declarou um país que o idioma do anúncio exclui — inglês não é Brasil. */
  | "ruled-out";

export interface ResolvedMarket {
  /** The market's name, spelled as it should be written. */
  country: string;
  code: string;
  timezone: string;
  currency: string;
  guides: string[];
  employers: string[];
  origin: MarketOrigin;
  /**
   * True when the country the model named was ruled out by the language, e o
   * mercado abaixo veio de DEFAULT_MARKET.
   *
   * Vale distinguir na tela: um mercado corrigido não foi lido do anúncio, é
   * o padrão do idioma. "Inglês, logo Estados Unidos" acerta a maioria e erra
   * um anúncio britânico por um múltiplo, então quem confere precisa saber
   * que está olhando um padrão e não uma evidência.
   */
  corrected: boolean;
  /**
   * O país que o plano tinha lido, quando ele foi descartado. Sem isto a tela
   * diz que corrigiu sem dizer o que corrigiu, e a correção não pode ser
   * julgada por quem lê.
   */
  requested: string | null;
}

/**
 * The market to price this posting in.
 *
 * The model's answer is taken unless the posting's own language rules it out.
 * A Brazilian advertisement is written in Portuguese, so an English posting is
 * not a Brazilian job however the summary reads — and that was not a
 * hypothetical: it happened, and produced a band off by a multiple. Where the
 * two disagree, the language wins, because it is evidence from the posting
 * itself rather than an inference about it.
 *
 * A country nobody has a list for returns null, and the lookup falls back to
 * the open web — worse than a named list, and never nothing.
 */
export function resolveMarket(country: string, language: PostingLanguage): ResolvedMarket | null {
  const asked = normalise(country);

  // Sem país nenhum: o padrão do idioma, declarado como padrão.
  if (!asked || UNSTATED.includes(asked)) return marketAt(DEFAULT_MARKET[language], "unstated", null);

  const named = BY_ALIAS.get(asked);
  // Um país de verdade sem lista de fontes. Mantido: a busca vai para a web
  // aberta, que é pior, e é melhor que o mercado errado.
  if (!named) return null;

  // Copiado para PostingLanguage[]: cada mercado declara a sua própria tupla
  // de idiomas, e `includes` sobre a união delas estreita o argumento até
  // never — o tipo fica correto e impossível de chamar.
  const spoken: PostingLanguage[] = [...MARKETS[named].languages];
  if (spoken.includes(language)) return marketAt(named, "read", null);

  return marketAt(DEFAULT_MARKET[language], "ruled-out", MARKETS[named].name);
}

function marketAt(key: MarketKey, origin: MarketOrigin, requested: string | null): ResolvedMarket {
  const market = MARKETS[key];
  return {
    country: market.name,
    origin,
    requested,
    code: market.code,
    timezone: market.timezone,
    currency: market.currency,
    guides: market.guides,
    employers: market.employers,
    corrected: origin !== "read"
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
