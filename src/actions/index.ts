/**
 * The tailoring action.
 *
 * An Astro Action rather than an API route, which is the framework's own answer
 * to "call server code from a page". It is worth the swap for what it removes:
 * the input validation, the JSON parsing, the content-type check and the CSRF
 * origin check were all hand-written in the route this replaces, and every one
 * of them is something Astro already does — correctly, and the same way in
 * every project that uses it.
 *
 * What it leaves us to write is the part that is actually ours: deciding what
 * counts as a usable posting, and translating a failure into something the page
 * can show.
 *
 * The action runs on the server, so the OpenAI key never reaches a browser.
 * Access to it is Cloudflare Access's job, in front of /tailor and /_actions.
 */
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
  OPENAI_API_KEY,
  OPENAI_TRIAGE_MODEL,
  OPENAI_TAILOR_MODEL,
  OPENAI_SALARY_MODEL
} from "astro:env/server";
import { InputError, MAX_POSTING, tailorResume } from "../lib/resume";
import { OpenAiError, RefusalError } from "../lib/resume/client";

/** Long enough for a reasoning model on a long posting, short enough that a
 *  hung upstream cannot hold a request open indefinitely. */
const TIMEOUT_MS = 90_000;

export const server = {
  tailor: defineAction({
    // Accepts a form post as well as a JSON call, so the page works with
    // JavaScript switched off and the same action is callable from a script.
    accept: "form",
    input: z.object({
      posting: z
        .string()
        .trim()
        // A posting this short says nothing to adapt to, and asking the model
        // anyway costs money to be told so.
        .min(40, "Cole a vaga inteira: esse texto é curto demais para adaptar.")
        .max(MAX_POSTING, `A vaga passa de ${MAX_POSTING} caracteres.`),
      /*
       * No locale field: the posting's own language decides, always. An
       * override would be a second answer to a question that already has one,
       * and the wrong answer is silent — a résumé in a language the person who
       * wrote the advertisement does not read.
       */
    }),
    async handler({ posting }) {
      if (!OPENAI_API_KEY) {
        throw new ActionError({
          code: "SERVICE_UNAVAILABLE",
          message: "Nenhuma chave da OpenAI configurada neste servidor."
        });
      }

      try {
        return await tailorResume(
          {
            posting,
            model: OPENAI_TAILOR_MODEL,
            models: {
              triage: OPENAI_TRIAGE_MODEL,
              tailor: OPENAI_TAILOR_MODEL,
              salary: OPENAI_SALARY_MODEL
            }
          },
          { apiKey: OPENAI_API_KEY, signal: AbortSignal.timeout(TIMEOUT_MS) }
        );
      } catch (error) {
        throw asActionError(error);
      }
    }
  })
};

/**
 * Only messages this code wrote are returned.
 *
 * An upstream error body can echo the request back, key included, and a 401
 * from OpenAI is a fact about the deployment rather than about the caller.
 * Neither belongs in a response, so the original is logged and a written one
 * is sent.
 */
function asActionError(error: unknown) {
  if (error instanceof ActionError) return error;

  if (error instanceof InputError) {
    return new ActionError({ code: "BAD_REQUEST", message: error.message });
  }
  if (error instanceof RefusalError) {
    return new ActionError({
      code: "UNPROCESSABLE_CONTENT",
      message: "O modelo recusou esta vaga."
    });
  }
  if (error instanceof OpenAiError) {
    return new ActionError({
      code: "BAD_GATEWAY",
      message:
        error.status === 401
          ? "A chave da OpenAI deste servidor foi recusada."
          : "A OpenAI respondeu com erro."
    });
  }
  if (error instanceof Error && error.name === "TimeoutError") {
    return new ActionError({
      code: "GATEWAY_TIMEOUT",
      message: "A geração passou do tempo e foi cancelada."
    });
  }

  console.error("tailor action: unexpected failure", error);
  return new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Algo deu errado na geração." });
}
