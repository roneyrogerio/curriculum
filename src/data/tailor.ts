/*
 * The words of the private tailoring page, in every language the site speaks.
 *
 * They are here rather than in `Labels` because they belong to one page that
 * nobody but the author opens, and `Labels` is the vocabulary of the résumé
 * itself — the thing every visitor reads. Mixing the two would have put forty
 * strings about token counts and salary bands in the same object as "Formação
 * acadêmica".
 *
 * Interpolation is deliberately absent: each field is a fragment, and the page
 * composes them. A template function would read better here and worse there,
 * because several of these fragments sit around a `<b>` in the markup.
 */
import type { Locale } from "./types";

export interface TailorCopy {
  pageTitle: string;
  hint: string;
  print: string;
  standardResume: string;
  backToSite: string;
  placeholder: string;
  postingLabel: string;
  generate: string;
  generating: string;
  languageNote: string;
  /** The switch beside the button: whether to look the salary up at all. */
  salaryToggle: string;
  pending: string;
  errorPrefix: string;
  rationale: string;
  postingTitle: string;
  /** Precedes the contract regime the posting states: "contrato CLT". */
  contract: string;
  contractUnknown: string;
  sourcePosting: string;
  sourceMarket: string;
  advertisedAs: string;
  dutiesOf: string;
  perMonth: string;
  perYear: string;
  bandRow: string;
  medianRow: string;
  askRow: string;
  /** Precedes the other regime: "Equivalente PJ:". */
  equivalent: string;
  askWord: string;
  bandWord: string;
  factorWord: string;
  askTitle: string;
  fitBefore: string;
  fitAfter: string;
  fitUnknown: string;
  marketTitle: string;
  noSourceList: string;
  searchedAs: string;
  companyWord: string;
  sourcesTitle: string;
  notInDocument: string;
  violationsTitle: string;
  noViolations: string;
  callsWord: string;
  searchesWord: string;
  inputTokens: string;
  cachedShare: string;
  outputTokens: string;
}

export const tailorByLocale: Record<Locale, TailorCopy> = {
  "pt-br": {
    pageTitle: "Adaptar currículo a uma vaga",
    hint: "Cole a vaga inteira, título incluído. O modelo escolhe e reescreve; não acrescenta.",
    print: "Imprimir",
    standardResume: "Currículo padrão",
    backToSite: "Voltar ao site",
    placeholder: "Cole aqui a descrição da vaga, com o título…",
    postingLabel: "Descrição da vaga",
    generate: "Gerar",
    generating: "Gerando",
    languageNote: "Anúncio em português gera currículo em português; em inglês, em inglês.",
    salaryToggle: "Estimar el salario",
    salaryToggle: "Estimar o salário",
    pending: "Gerando. Costuma levar de dez a vinte segundos.",
    errorPrefix: "Erro:",
    rationale: "O que o modelo fez:",
    postingTitle: "A vaga",
    contract: "contrato",
    contractUnknown: "contrato não informado",
    sourcePosting: "declarado no anúncio",
    sourceMarket: "pesquisa de mercado",
    advertisedAs: "anunciada como",
    dutiesOf: "atribuições de",
    perMonth: "por mês",
    perYear: "por ano",
    bandRow: "faixa",
    medianRow: "mediana",
    askRow: "pedir",
    equivalent: "Equivalente",
    askWord: "pedir",
    bandWord: "faixa",
    factorWord: "fator",
    askTitle: "Pedir:",
    fitBefore: "atende",
    fitAfter: "do que a vaga pede.",
    fitUnknown: "o encaixe no perfil não foi avaliado com confiança.",
    marketTitle: "Mercado:",
    noSourceList:
      "país sem lista de fontes própria: a busca foi na web aberta, com a precisão que isso dá",
    searchedAs: "Pesquisado como:",
    companyWord: "empresa:",
    sourcesTitle: "Fontes:",
    notInDocument: "Nada disto sai no documento.",
    violationsTitle: "Reescritas rejeitadas e revertidas ao original:",
    noViolations: "Nenhuma reescrita saiu do que o currículo já diz.",
    callsWord: "chamadas",
    searchesWord: "buscas",
    inputTokens: "tokens de entrada",
    cachedShare: "em cache",
    outputTokens: "de saída"
  },

  "pt-pt": {
    pageTitle: "Adaptar currículo a uma vaga",
    hint: "Cole a vaga inteira, título incluído. O modelo escolhe e reescreve; não acrescenta.",
    print: "Imprimir",
    standardResume: "Currículo padrão",
    backToSite: "Voltar ao site",
    placeholder: "Cole aqui a descrição da vaga, com o título…",
    postingLabel: "Descrição da vaga",
    generate: "Gerar",
    generating: "A gerar",
    languageNote: "Anúncio em português gera currículo em português; em inglês, em inglês.",
    salaryToggle: "Estimar o salário",
    pending: "A gerar. Costuma demorar de dez a vinte segundos.",
    errorPrefix: "Erro:",
    rationale: "O que o modelo fez:",
    postingTitle: "A vaga",
    contract: "contrato",
    contractUnknown: "contrato não indicado",
    sourcePosting: "indicado no anúncio",
    sourceMarket: "pesquisa de mercado",
    advertisedAs: "anunciada como",
    dutiesOf: "funções de",
    perMonth: "por mês",
    perYear: "por ano",
    bandRow: "intervalo",
    medianRow: "mediana",
    askRow: "pedir",
    equivalent: "Equivalente",
    askWord: "pedir",
    bandWord: "intervalo",
    factorWord: "fator",
    askTitle: "Pedir:",
    fitBefore: "cumpre",
    fitAfter: "do que a vaga pede.",
    fitUnknown: "o encaixe no perfil não foi avaliado com confiança.",
    marketTitle: "Mercado:",
    noSourceList:
      "país sem lista de fontes própria: a procura foi na web aberta, com a precisão que isso dá",
    searchedAs: "Procurado como:",
    companyWord: "empresa:",
    sourcesTitle: "Fontes:",
    notInDocument: "Nada disto sai no documento.",
    violationsTitle: "Reescritas rejeitadas e revertidas ao original:",
    noViolations: "Nenhuma reescrita saiu do que o currículo já diz.",
    callsWord: "chamadas",
    searchesWord: "procuras",
    inputTokens: "tokens de entrada",
    cachedShare: "em cache",
    outputTokens: "de saída"
  },

  "en-us": {
    pageTitle: "Tailor résumé to a posting",
    hint: "Paste the whole posting, title included. The model picks and rewrites; it never adds.",
    print: "Print",
    standardResume: "Standard résumé",
    backToSite: "Back to site",
    placeholder: "Paste the job description here, with the title…",
    postingLabel: "Job description",
    generate: "Generate",
    generating: "Generating",
    languageNote: "A posting in English yields a résumé in English; in Portuguese, in Portuguese.",
    salaryToggle: "Estimate the salary",
    pending: "Generating. This usually takes ten to twenty seconds.",
    errorPrefix: "Error:",
    rationale: "What the model did:",
    postingTitle: "The posting",
    contract: "contract",
    contractUnknown: "contract not stated",
    sourcePosting: "stated in the posting",
    sourceMarket: "market research",
    advertisedAs: "advertised as",
    dutiesOf: "duties of",
    perMonth: "per month",
    perYear: "per year",
    bandRow: "band",
    medianRow: "median",
    askRow: "ask",
    equivalent: "Equivalent",
    askWord: "ask",
    bandWord: "band",
    factorWord: "factor",
    askTitle: "Ask:",
    fitBefore: "meets",
    fitAfter: "of what the posting asks for.",
    fitUnknown: "the fit against the profile was not assessed with confidence.",
    marketTitle: "Market:",
    noSourceList:
      "country with no source list of its own: the search ran on the open web, with the precision that affords",
    searchedAs: "Searched as:",
    companyWord: "company:",
    sourcesTitle: "Sources:",
    notInDocument: "None of this appears in the document.",
    violationsTitle: "Rewrites rejected and reverted to the original:",
    noViolations: "No rewrite went beyond what the résumé already says.",
    callsWord: "calls",
    searchesWord: "searches",
    inputTokens: "input tokens",
    cachedShare: "cached",
    outputTokens: "output"
  },

  "en-gb": {
    pageTitle: "Tailor CV to a vacancy",
    hint: "Paste the whole advertisement, title included. The model picks and rewrites; it never adds.",
    print: "Print",
    standardResume: "Standard CV",
    backToSite: "Back to site",
    placeholder: "Paste the job advertisement here, with the title…",
    postingLabel: "Job advertisement",
    generate: "Generate",
    generating: "Generating",
    languageNote: "An advertisement in English yields a CV in English; in Portuguese, in Portuguese.",
    salaryToggle: "Estimate the salary",
    pending: "Generating. This usually takes ten to twenty seconds.",
    errorPrefix: "Error:",
    rationale: "What the model did:",
    postingTitle: "The vacancy",
    contract: "contract",
    contractUnknown: "contract not stated",
    sourcePosting: "stated in the advertisement",
    sourceMarket: "market research",
    advertisedAs: "advertised as",
    dutiesOf: "duties of",
    perMonth: "per month",
    perYear: "per year",
    bandRow: "band",
    medianRow: "median",
    askRow: "ask",
    equivalent: "Equivalent",
    askWord: "ask",
    bandWord: "band",
    factorWord: "factor",
    askTitle: "Ask:",
    fitBefore: "meets",
    fitAfter: "of what the vacancy asks for.",
    fitUnknown: "the fit against the profile was not assessed with confidence.",
    marketTitle: "Market:",
    noSourceList:
      "country with no source list of its own: the search ran on the open web, with the precision that affords",
    searchedAs: "Searched as:",
    companyWord: "company:",
    sourcesTitle: "Sources:",
    notInDocument: "None of this appears in the document.",
    violationsTitle: "Rewrites rejected and reverted to the original:",
    noViolations: "No rewrite went beyond what the CV already says.",
    callsWord: "calls",
    searchesWord: "searches",
    inputTokens: "input tokens",
    cachedShare: "cached",
    outputTokens: "output"
  },

  es: {
    pageTitle: "Adaptar el currículum a una oferta",
    hint: "Pega la oferta entera, título incluido. El modelo elige y reescribe; no añade.",
    print: "Imprimir",
    standardResume: "Currículum estándar",
    backToSite: "Volver al sitio",
    placeholder: "Pega aquí la descripción de la oferta, con el título…",
    postingLabel: "Descripción de la oferta",
    generate: "Generar",
    generating: "Generando",
    languageNote: "Una oferta en español da un currículum en español; en inglés, en inglés.",
    pending: "Generando. Suele tardar de diez a veinte segundos.",
    errorPrefix: "Error:",
    rationale: "Lo que hizo el modelo:",
    postingTitle: "La oferta",
    contract: "contrato",
    contractUnknown: "contrato no indicado",
    sourcePosting: "declarado en la oferta",
    sourceMarket: "investigación de mercado",
    advertisedAs: "anunciada como",
    dutiesOf: "funciones de",
    perMonth: "al mes",
    perYear: "al año",
    bandRow: "rango",
    medianRow: "mediana",
    askRow: "pedir",
    equivalent: "Equivalente",
    askWord: "pedir",
    bandWord: "rango",
    factorWord: "factor",
    askTitle: "Pedir:",
    fitBefore: "cumple el",
    fitAfter: "de lo que pide la oferta.",
    fitUnknown: "el encaje con el perfil no se evaluó con confianza.",
    marketTitle: "Mercado:",
    noSourceList:
      "país sin lista de fuentes propia: la búsqueda fue en la web abierta, con la precisión que eso da",
    searchedAs: "Buscado como:",
    companyWord: "empresa:",
    sourcesTitle: "Fuentes:",
    notInDocument: "Nada de esto sale en el documento.",
    violationsTitle: "Reescrituras rechazadas y revertidas al original:",
    noViolations: "Ninguna reescritura fue más allá de lo que el currículum ya dice.",
    callsWord: "llamadas",
    searchesWord: "búsquedas",
    inputTokens: "tokens de entrada",
    cachedShare: "en caché",
    outputTokens: "de salida"
  },

  fr: {
    pageTitle: "Adapter le CV à une offre",
    hint: "Collez l'offre entière, titre compris. Le modèle choisit et reformule ; il n'ajoute rien.",
    print: "Imprimer",
    standardResume: "CV standard",
    backToSite: "Retour au site",
    placeholder: "Collez ici la description du poste, avec le titre…",
    postingLabel: "Description du poste",
    generate: "Générer",
    generating: "Génération",
    languageNote: "Une offre en français donne un CV en français ; en anglais, en anglais.",
    salaryToggle: "Estimer le salaire",
    pending: "Génération en cours. Cela prend d'ordinaire dix à vingt secondes.",
    errorPrefix: "Erreur :",
    rationale: "Ce que le modèle a fait :",
    postingTitle: "L'offre",
    contract: "contrat",
    contractUnknown: "contrat non précisé",
    sourcePosting: "indiqué dans l'offre",
    sourceMarket: "étude de marché",
    advertisedAs: "annoncée comme",
    dutiesOf: "missions de",
    perMonth: "par mois",
    perYear: "par an",
    bandRow: "fourchette",
    medianRow: "médiane",
    askRow: "demander",
    equivalent: "Équivalent",
    askWord: "demander",
    bandWord: "fourchette",
    factorWord: "facteur",
    askTitle: "Demander :",
    fitBefore: "répond à",
    fitAfter: "de ce que l'offre demande.",
    fitUnknown: "l'adéquation au profil n'a pas été évaluée avec confiance.",
    marketTitle: "Marché :",
    noSourceList:
      "pays sans liste de sources propre : la recherche a eu lieu sur le web ouvert, avec la précision que cela donne",
    searchedAs: "Recherché comme :",
    companyWord: "entreprise :",
    sourcesTitle: "Sources :",
    notInDocument: "Rien de tout cela ne figure dans le document.",
    violationsTitle: "Reformulations rejetées et rétablies à l'original :",
    noViolations: "Aucune reformulation n'est allée au-delà de ce que le CV dit déjà.",
    callsWord: "appels",
    searchesWord: "recherches",
    inputTokens: "jetons en entrée",
    cachedShare: "en cache",
    outputTokens: "en sortie"
  }
};
