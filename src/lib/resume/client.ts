/**
 * The call to OpenAI's Responses API.
 *
 * `fetch` is injected rather than reached for, so this module has no ambient
 * dependency on a runtime: the endpoint passes the server's fetch, and a test
 * passes a stub and asserts on the request body without a network or a key.
 * Nothing here knows what a résumé is — that is `compose.ts` — and nothing
 * anywhere else knows what OpenAI is.
 */
import type { ResumePlan } from "./plan";

/** The cheapest that does the job. The full ranking is in `.env.example`. */
export const DEFAULT_MODEL = "gpt-5-nano";
const ENDPOINT = "https://api.openai.com/v1/responses";

/**
 * Price per million tokens, for the figure the panel shows.
 *
 * Cached input bills at a tenth, which is why the résumé goes before the
 * posting in the prompt. A model missing from this table falls back to the
 * default's price: the figure comes out wrong, which beats the page failing
 * over a number in its footer.
 */
const RATES: Record<string, { input: number; output: number }> = {
  "gpt-5-nano": { input: 0.05, output: 0.4 },
  "gpt-5-mini": { input: 0.25, output: 2.0 },
  "gpt-5.6-luna": { input: 0.2, output: 1.2 },
  "gpt-5.6-terra": { input: 2.0, output: 12.0 },
  "gpt-5.6-sol": { input: 4.0, output: 20.0 },
  "gpt-6-astra": { input: 10.0, output: 50.0 }
};

/**
 * `reasoning` exists from the GPT-5 family onward. Sending it to a gpt-4o or
 * gpt-4.1 returns a 400 whose message does not name the offending parameter,
 * so it is omitted rather than left to make a cheaper model look broken.
 */
function supportsReasoning(model: string) {
  return /^gpt-([5-9]|\d{2,})/.test(model);
}

export interface CompletionRequest {
  /** Constant across requests, so it sits at the head of the cached prefix. */
  instructions: string;
  /** The CV first, the posting last; see `prompt.ts` on why the order matters. */
  input: string;
  /** The Structured Output format, from `schema.ts`. */
  format: unknown;
}

export interface Usage {
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
}

export interface CompletionResult {
  plan: ResumePlan;
  usage: Usage;
  model: string;
}

export interface ClientOptions {
  apiKey: string;
  model?: string;
  fetch?: typeof globalThis.fetch;
  /** Abort signal, so a hung request cannot hold a server thread forever. */
  signal?: AbortSignal;
}

/** The model refused rather than answered. Surfaced, never retried silently. */
export class RefusalError extends Error {
  constructor(public readonly refusal: string) {
    super(refusal);
    this.name = "RefusalError";
  }
}

export class OpenAiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "OpenAiError";
  }
}

export function buildBody(request: CompletionRequest, model: string) {
  return {
    model,
    instructions: request.instructions,
    input: request.input,
    // `strict: true` constrains decoding to the schema, so the answer parses or
    // the request fails. There is no partially valid response to handle.
    text: { format: request.format },
    /*
     * Enough thinking to choose what to cut, not enough to pay for an essay.
     * Selecting and rephrasing given facts is a judgement task, not a
     * derivation, and "low" is where the quality curve flattens while the bill
     * keeps climbing.
     */
    ...(supportsReasoning(model) ? { reasoning: { effort: "low" } } : {}),
    // A runaway generation would be a bill, not a better résumé: the answer is
    // bounded by the schema's maxItems, so this is a ceiling, not a target.
    max_output_tokens: 4000,
    // Groups this feature's cache accounting apart from anything else the key
    // is used for, and keeps related requests routed to the same cache.
    prompt_cache_key: "resume-tailor-v1",
    // Nothing is kept on OpenAI's side: the input is a résumé and a posting,
    // and neither needs to outlive the response.
    store: false
  };
}

export async function complete(
  request: CompletionRequest,
  options: ClientOptions
): Promise<CompletionResult> {
  const model = options.model ?? DEFAULT_MODEL;
  const call = options.fetch ?? globalThis.fetch;

  const response = await call(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify(buildBody(request, model)),
    signal: options.signal
  });

  if (!response.ok) {
    // The body may carry the key back in an echoed request on some errors, so
    // only the message is read, and only the message is ever logged upstream.
    const detail = await response.text().catch(() => "");
    throw new OpenAiError(messageOf(detail) ?? `OpenAI returned ${response.status}`, response.status);
  }

  return parseResponse(await response.json(), model);
}

function messageOf(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return typeof parsed?.error?.message === "string" ? parsed.error.message : null;
  } catch {
    return null;
  }
}

/**
 * Exported so a test can feed it a recorded response. The output is an array of
 * items because the API can return reasoning alongside the message; the text is
 * whichever content part carries it, and a refusal arrives as its own part
 * rather than as malformed JSON.
 */
export function parseResponse(payload: any, model: string): CompletionResult {
  if (payload?.status === "incomplete") {
    throw new OpenAiError(
      `The answer was cut short (${payload?.incomplete_details?.reason ?? "unknown"}).`,
      502
    );
  }

  const parts = (payload?.output ?? [])
    .filter((item: any) => item?.type === "message")
    .flatMap((item: any) => item?.content ?? []);

  const refusal = parts.find((part: any) => part?.type === "refusal");
  if (refusal) throw new RefusalError(String(refusal.refusal ?? "refused"));

  const text = parts.find((part: any) => part?.type === "output_text")?.text;
  if (typeof text !== "string") throw new OpenAiError("OpenAI returned no text output.", 502);

  let plan: ResumePlan;
  try {
    plan = JSON.parse(text);
  } catch {
    throw new OpenAiError("OpenAI returned text that is not the requested JSON.", 502);
  }

  const usage = payload?.usage ?? {};
  return {
    plan,
    model: payload?.model ?? model,
    usage: {
      inputTokens: usage.input_tokens ?? 0,
      cachedTokens: usage.input_tokens_details?.cached_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0
    }
  };
}

/** Rough cost in US dollars, for the panel's footer. */
export function costOf(usage: Usage, model: string = DEFAULT_MODEL) {
  const rate = RATES[model] ?? RATES[DEFAULT_MODEL];
  const fresh = Math.max(0, usage.inputTokens - usage.cachedTokens);
  // Cached input bills at a tenth, which is the whole reason the prompt puts
  // the résumé before the posting.
  return (fresh * rate.input + usage.cachedTokens * (rate.input / 10) + usage.outputTokens * rate.output) / 1e6;
}
