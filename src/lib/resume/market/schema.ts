/**
 * The Structured Output the salary lookup must answer in.
 *
 * The shape is what makes the answer checkable: every figure arrives attached
 * to the page it was copied from, so the band can be computed here instead of
 * being taken on trust. See `band.ts` for what is then done with it.
 */
import { CURRENCIES } from "./types";

export const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "min",
    "median",
    "max",
    "currency",
    "period",
    "source",
    "note",
    "ask",
    "askNote",
    "postingRegime",
    "bandRegime",
    "pjOverClt",
    "regimeNote",
    "observations"
  ],
  properties: {
    observations: {
      type: "array",
      description:
        "Uma entrada por página que você abriu e que publica números para este " +
        "cargo e este nível. Copie o que a página diz; não arredonde, não " +
        "combine duas fontes numa entrada, não inclua uma fonte que você não " +
        "abriu. Abra pelo menos três. A faixa final é calculada a partir " +
        "daqui — não é o que você escrever nos campos abaixo.",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "url",
          "scope",
          "role",
          "level",
          "min",
          "median",
          "max",
          "currency",
          "period",
          "regime",
          "asOf"
        ],
        properties: {
          title: { type: "string", description: "A publicação: 'Glassdoor', 'Robert Half', o nome do site." },
          url: { type: "string", description: "A página exata de onde os números saíram." },
          scope: {
            type: "string",
            enum: ["company", "market"],
            description:
              "'company' quando a página publica o que esta empresa em " +
              "específico paga — avaliações de funcionários, vagas dela com " +
              "faixa, dados salariais dela. 'market' para guia salarial, " +
              "pesquisa de mercado, média do cargo no país. Não marque como " +
              "'company' uma média do setor: é a empresa nomeada ou nada."
          },
          role: { type: "string", description: "O cargo a que os números da página se referem, nas palavras dela." },
          level: { type: "string", description: "O nível a que se referem: júnior, pleno, sênior." },
          min: { type: "number", description: "O piso que a página publica. Se ela só der um número, repita-o nos três." },
          median: { type: "number", description: "A mediana ou média que a página publica." },
          max: { type: "number", description: "O teto que a página publica." },
          currency: {
            type: "string",
            enum: [...CURRENCIES],
            description: "A moeda em que esta página publica, não a da vaga."
          },
          period: { type: "string", enum: ["month", "year"], description: "Como a página publica: mensal ou anual." },
          regime: {
            type: "string",
            enum: ["CLT", "PJ", "não se aplica"],
            description: "Em que regime os números da página estão. Guia salarial brasileiro é CLT salvo dizer o contrário."
          },
          asOf: { type: "string", description: "De quando são os dados, como a página informa. 'não informado' se ela não disser." }
        }
      }
    },
    min: {
      type: "number",
      description:
        "Piso bruto da faixa, na sua leitura. Só é usado quando as observações " +
        "acima não bastam para calcular uma: a faixa mostrada vem delas."
    },
    median: {
      type: "number",
      description:
        "O meio do mercado na sua leitura — mediana, 50º percentil. Também é " +
        "apenas o recurso para quando faltarem observações."
    },
    max: { type: "number", description: "Teto bruto, na sua leitura. Idem." },
    currency: {
      type: "string",
      enum: [...CURRENCIES],
      description:
        "A moeda do país que paga esta vaga — a do empregador, não a sua nem " +
        "a do candidato. Nada aqui é convertido depois: o número é negociado " +
        "nesta moeda, e é nela que ele aparece na tela."
    },
    period: {
      type: "string",
      enum: ["month", "year"],
      description: "A convenção do mercado da vaga: mensal no Brasil, anual nos EUA."
    },
    source: {
      type: "string",
      enum: ["posting", "search"],
      description: "'posting' só se o próprio anúncio declarar a faixa."
    },
    note: {
      type: "string",
      description:
        "Uma linha: de onde veio o número. Se foi busca, diga o que as fontes " +
        "mostram e de quando são. Se achou dados da própria empresa, diga isso " +
        "primeiro — a faixa de uma empresa vale mais que a média do país."
    },
    ask: {
      type: "number",
      description:
        "Quanto esta pessoa deve pedir, na mesma moeda e período. Você acabou de " +
        "ler as fontes: use o que elas mostram, e não uma fração da faixa. O topo " +
        "é para quem excede todos os requisitos; um encaixe bom mas com lacunas " +
        "pede acima do meio, não encostado no teto. Numa faixa estreita, alguns " +
        "por cento são a diferença entre negociar e ser descartado. Considere " +
        "também se a empresa paga acima ou abaixo do mercado, se isso apareceu."
    },
    postingRegime: {
      type: "string",
      enum: ["CLT", "PJ", "não informado", "não se aplica"],
      description:
        "O contrato que o anúncio pede, se disser. 'não informado' quando o " +
        "anúncio é brasileiro e não diz; 'não se aplica' fora do Brasil."
    },
    bandRegime: {
      type: "string",
      enum: ["CLT", "PJ", "não se aplica"],
      description:
        "Em qual regime a faixa acima está cotada. Guias salariais brasileiros " +
        "publicam CLT: se a sua fonte for um deles, é CLT. Diga PJ só se a " +
        "fonte for explicitamente de valores PJ."
    },
    pjOverClt: {
      type: "number",
      description:
        "Quanto o mesmo trabalho vale como PJ, em múltiplo do valor CLT, neste " +
        "mercado e neste nível — algo entre 1,2 e 1,4 no Brasil, conforme o que " +
        "as fontes mostrarem. É o que cobre 13º, férias com um terço, FGTS e a " +
        "parte patronal, que o PJ não recebe. Use 1 fora do Brasil."
    },
    regimeNote: {
      type: "string",
      description: "Uma linha sobre o que esse múltiplo cobre, e de onde veio."
    },
    askNote: {
      type: "string",
      description:
        "Uma linha, em termos de negociação: por que esse número, e o que no " +
        "perfil o sustenta ou o limita."
    }
  }
};
