/**
 * Shared analysis of a job posting. Kept separate from the CV so the tailoring
 * logic can never do anything but read the posting's vocabulary.
 */
import { eng, por } from "stopword";

/*
 * Grammar words come from the maintained `stopword` lists, which cover far more
 * than a hand-written list did. What they cannot know is the vocabulary of a
 * job advertisement itself — "vaga", "auxílio", "tenha" — so that part stays
 * here, where it belongs.
 */
const POSTING_WORDS = [
  "tenha","saiba","somos","nascemos","procuramos","valorizamos","vivemos",
  "razão","cultura","valores","cliente","pessoas","pessoa","dia","tais","junto",
  "propósito","sonhos","resultados","oportunidades","desafios","time","equipe",
  "responsável","responsabilidade","capacidade","conhecimento","conhecimentos",
  "experiência","interesse","benefício","benefícios","auxílio","vale","pacote",
  "remuneração","salário","plano","seguro","convênio","kit","opcionais","gratuito",
  "elegibilidade","cargo","cargos","vagas","vaga","processo","seletivo",
  "recrutadores","deficiência","saúde","medicamentos","creche","filho","pais",
  "empresa","trabalho","atuar","desejável","requisitos","atividades","diferencial",
  "área","nível","anos","forma","muito",
  "about","culture","values","benefits","perks","salary","insurance","health",
  "optional","eligibility","company","team","role","job","years","required",
  "requirements","responsibilities","looking","strong","plus","experience",
  "knowledge","skills","work","opportunity","candidate"
];

const STOPWORDS = new Set([...por, ...eng, ...POSTING_WORDS]);

/**
 * A posting is mostly not about the job: company story, culture and benefits
 * routinely fill two thirds of it, and their vocabulary ("auxílio", "cultura",
 * "Stone") would otherwise drown the requirements. This keeps the part that
 * describes the work.
 */
const SECTION_START =
  /^[ \t]*(?:requisitos?|o que esperamos(?: de você)?|o que aumenta[^\n]*|responsabilidades?|atividades?|qualifica\u00e7\u00f5es?|diferenciais?|como \u00e9 ser[^\n]*|requirements?|responsibilities|what you.{0,3}ll do|what we expect|must[- ]have|nice[- ]to[- ]have|qualifications|the role)[ \t]*:?[ \t]*$/im;

const SECTION_END =
  /^[ \t]*(?:benef[ií]cios?[^\n]*|nosso pacote[^\n]*|remunera\u00e7\u00e3o[^\n]*|pacote de[^\n]*|sal[aá]rio[^\n]*|opcionais|benefits|perks|compensation|what we offer|o que oferecemos)[ \t]*:?[ \t]*$/im;

const NOISE_LINE =
  /\b(?:aux[ií]lio|vale refei|vale alimenta|plano de sa[uú]de|seguro de vida|conv[êe]nio|quick massage|wellhub|totalpass|gympass|pet club|home office\b.*aux|kit acolhimento|telemedicina|coparticipa)/i;

/**
 * Postings separate what they demand from what they would merely like, and the
 * two must not be scored together: counting an explicitly optional tool against
 * a candidate produces a low score for a job they actually fit.
 */
const PREFERRED_START =
  /^[ \t]*(?:o que aumenta[^\n]*|diferenciais?|desej[aá]ve(?:l|is)|nice[- ]to[- ]have|bonus|preferred|a plus)[ \t]*:?[ \t]*$/im;

export interface PostingSections {
  /** What the posting demands. Coverage here is what the score reports. */
  required: string;
  /** What it would like. Reported apart, never counted as a gap. */
  preferred: string;
}

export function splitRequirements(posting: string): PostingSections {
  const body = relevantSection(posting);
  const split = body.match(PREFERRED_START);
  if (!split?.index) return { required: body, preferred: "" };
  return { required: body.slice(0, split.index), preferred: body.slice(split.index) };
}

/** Narrows a posting to the part that describes the work. */
export function relevantSection(posting: string) {
  const start = posting.match(SECTION_START);
  const from = start?.index ?? 0;

  const tail = posting.slice(from);
  const end = tail.match(SECTION_END);
  const body = end?.index ? tail.slice(0, end.index) : tail;

  const cleaned = body
    .split("\n")
    .filter((line) => !NOISE_LINE.test(line))
    .join("\n");

  // A posting with no recognisable structure is used whole, minus the noise.
  return cleaned.trim().length > 120 ? cleaned : posting.split("\n").filter((l) => !NOISE_LINE.test(l)).join("\n");
}

export function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./ -]/gu, " ")
    .replace(/(^|\s)[./-]+|[./-]+(?=\s|$)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * Single words plus two-word phrases, counted per line so a phrase never
 * straddles two bullet points.
 */
export function terms(value: string) {
  const found = new Map<string, number>();
  const add = (term: string) => found.set(term, (found.get(term) ?? 0) + 1);
  // Commas, slashes and brackets separate list items. Treating them as phrase
  // boundaries stops "Desempenho, Escalabilidade, Segurança" from inventing the
  // phrases "desempenho escalabilidade" and "escalabilidade segurança".
  for (const line of value.split(/[\n.;:!?,/()\[\]|•]+/)) {
    const words = tokens(line);
    words.forEach((word, index) => {
      add(word);
      if (index + 1 < words.length) add(`${word} ${words[index + 1]}`);
    });
  }
  return found;
}

/**
 * Technology names carry a capital somewhere ("gRPC", "PostgreSQL") or digits
 * and symbols ("CI/CD"). Ordinary prose does not, which is what separates
 * signal from filler. A capital only counts when it is not merely the start of
 * a sentence; a hyphen is not a sentence end, since bullet lines often begin
 * with the very technology that matters.
 */
/**
 * Technology words that are written in lower case and would slip past the
 * capitalisation rule below: "arquitetura de microsserviços" never shouts.
 */
const LEXICON = new Set([
  "microsserviços","microservicos","microservices","mensageria","messaging","fila","filas","queue","queues",
  "api","apis","rest","restful","grpc","graphql","websocket","websockets","webhook","webhooks",
  "banco","bancos","dados","database","databases","sql","nosql","relacional","relacionais","relational",
  "cache","caching","índices","indices","query","queries","consultas","modelagem","modeling",
  "nuvem","nuvens","cloud","serverless","container","containers","containerização","orquestração",
  "kubernetes","docker","terraform","ansible","helm","infraestrutura","infrastructure",
  "observabilidade","observability","monitoramento","monitoring","métricas","metrics","logs","logging",
  "tracing","rastreamento","alertas","alerting","telemetria","telemetry",
  "escalabilidade","scalability","disponibilidade","availability","confiabilidade","reliability",
  "resiliência","resilience","tolerância","desempenho","performance","latência","latency","throughput",
  "segurança","security","autenticação","authentication","autorização","authorization","criptografia",
  "testes","tests","testing","unitários","integração","integration","cobertura","coverage",
  "arquitetura","architecture","design","padrões","patterns","hexagonal","event","sourcing","cqrs",
  "concorrência","concurrency","paralelismo","distribuídos","distributed","assíncrona","asynchronous",
  "versionamento","versioning","deploy","deployment","pipeline","pipelines","automação","automation",
  "revisão","review","reviews","refatoração","refactoring","documentação","documentation",
  "backend","frontend","fullstack","full-stack","devops","sre","agile","ágil","scrum","kanban",
  // Proper nouns of technology: capitalisation alone does not tell "Kafka"
  // apart from "Stone", so they are named here instead of guessed.
  "go","golang","java","python","javascript","typescript","php","ruby","rust","kotlin","swift","scala",
  "elixir","erlang","node","nodejs","deno","spring","django","flask","rails","laravel",
  "react","vue","angular","svelte","nuxt","astro","vite","webpack","three.js","threejs",
  "postgresql","postgres","mysql","mariadb","oracle","sqlite","mongodb","cassandra","dynamodb",
  "redis","memcached","elasticsearch","opensearch","clickhouse","bigquery","snowflake","databricks",
  "kafka","rabbitmq","zeromq","activemq","nats","pulsar","sqs","sns","pubsub",
  "aws","azure","gcp","openstack","heroku","vercel","netlify","cloudflare","digitalocean",
  "lambda","ec2","s3","rds","eks","ecs","fargate","knative","openshift",
  "kubernetes","k8s","docker","podman","terraform","pulumi","ansible","chef","puppet","helm",
  "jenkins","gitlab","github","bitbucket","circleci","argocd","sonarqube",
  "prometheus","grafana","datadog","newrelic","opentelemetry","jaeger","zipkin","sentry",
  "linux","unix","bash","shell","nginx","apache","envoy","istio","traefik",
  "git","jira","confluence","postman","swagger","openapi","protobuf","grpc","graphql",
  "vertex","sagemaker","rekognition","cloudformation","prisma","gin","vitest","playwright"
]);

/**
 * Decides which of a posting's words name a skill.
 *
 * Capitalisation alone is not evidence: in a Portuguese posting it marks
 * headings, sentence starts and the company's own name equally, which is how
 * "Stone", "Pessoa" and "Saiba" once counted as technologies and dragged the
 * score down. A word qualifies only when something vouches for it — the
 * candidate's own vocabulary, a known technology, or a shape that ordinary
 * prose never has (PostgreSQL, CI/CD, gRPC).
 */
export function technicalTerms(posting: string, ownVocabulary: Set<string> = new Set()) {
  const technical = new Set<string>();

  for (const match of posting.matchAll(/[\p{L}\p{N}][\p{L}\p{N}+#./-]*/gu)) {
    const raw = match[0].replace(/[./-]+$/, "");
    const word = normalize(raw);
    if (word.length < 2) continue;
    const distinctive = /\p{Ll}\p{Lu}|\p{Lu}\p{Lu}|[0-9+#/]/u.test(raw);
    if (distinctive || LEXICON.has(word) || ownVocabulary.has(word)) technical.add(word);
  }

  for (const term of terms(posting).keys()) {
    if (LEXICON.has(term) || ownVocabulary.has(term)) technical.add(term);
  }

  return technical;
}

/** How often the posting uses a phrase, matching on whole words only. */
export function weightOf(phrase: string, postingTerms: Map<string, number>) {
  return postingTerms.get(normalize(phrase)) ?? 0;
}

/** Whether the posting mentions the phrase at all, as a whole word. */
export function mentions(phrase: string, normalizedPosting: string) {
  const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u").test(normalizedPosting);
}

/** The wording the posting itself uses, preferred among equally true labels. */
export function preferredLabel(labels: string[], normalizedPosting: string) {
  return labels.find((label) => mentions(label, normalizedPosting)) ?? labels[0];
}

/**
 * Everything the CV itself names as a skill: the vocabulary of things that are
 * true. A posting word found here is, by construction, a real term worth
 * scoring, which is what keeps prose like "fazemos" out of the match.
 */
export function buildVocabulary(values: string[]) {
  const vocabulary = new Set<string>();
  for (const value of values) {
    const normalized = normalize(value);
    if (normalized) vocabulary.add(normalized);
    const words = tokens(value);
    words.forEach((word, index) => {
      vocabulary.add(word);
      if (index + 1 < words.length) vocabulary.add(`${word} ${words[index + 1]}`);
    });
  }
  return vocabulary;
}
