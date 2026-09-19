/**
 * Text comparison, for verification.
 *
 * Just enough of it to answer one question, which is the only one `verify.ts`
 * asks: does this rewritten sentence say something its source fact did not?
 * Everything here exists to make that comparison survive the ways the same
 * thing gets written — accents, casing, "Node.js" against "node".
 */
import { eng, por } from "stopword";

const STOPWORDS = new Set([...por, ...eng]);

/**
 * Proper nouns of technology.
 *
 * A list rather than a rule, because the shape of the word gives nothing away:
 * "Kafka" looks like "Stone" and "Redis" looks like "Roney". A name from here
 * in a rewrite is a claim, and has to be traceable to a fact — unlike a
 * concept such as "mensageria", which may become "filas" and stay true.
 */
export const PRODUCTS = new Set([
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

/** Whether the text mentions the phrase, as a whole word. */
export function mentions(phrase: string, normalizedHaystack: string) {
  const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u").test(normalizedHaystack);
}
