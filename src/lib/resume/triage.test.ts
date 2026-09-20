/**
 * The locale is composed, not answered.
 *
 * These cases are the ones that were wrong in production: an English posting
 * for a job in Brazil came back `pt-br` — the whole résumé in Portuguese
 * except the sentences the model rewrote — and a retry of the same posting
 * came back `en-us`. The language is now read off the page and the variant
 * looked up here, so neither answer depends on the model weighing a country
 * against a body of text.
 */
import { describe, expect, it } from "vitest";
import { localeOf, parseTriage } from "./triage";

const answer = (fields: Record<string, unknown>) => ({
  output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(fields) }] }],
  usage: { input_tokens: 1, input_tokens_details: { cached_tokens: 0 }, output_tokens: 1 }
});

describe("localeOf", () => {
  it("keeps an English posting English, whichever country pays for it", () => {
    expect(localeOf("en", "Brasil")).toBe("en-us");
    expect(localeOf("en", "Alemanha")).toBe("en-us");
    expect(localeOf("en", "Estados Unidos")).toBe("en-us");
  });

  it("lets the country pick the variant, and only the variant", () => {
    expect(localeOf("pt", "Portugal")).toBe("pt-pt");
    expect(localeOf("pt", "Brasil")).toBe("pt-br");
    expect(localeOf("en", "Reino Unido")).toBe("en-gb");
    expect(localeOf("en", "Irlanda")).toBe("en-gb");
  });

  it("reads the country as written, spacing and case included", () => {
    expect(localeOf("en", "  reino unido ")).toBe("en-gb");
  });

  it("has one résumé for Spanish and one for French, so the country is moot", () => {
    expect(localeOf("es", "Espanha")).toBe("es");
    expect(localeOf("es", "México")).toBe("es");
    expect(localeOf("fr", "Canadá")).toBe("fr");
  });
});

describe("parseTriage", () => {
  it("composes the locale from the answer rather than reading one", () => {
    const triage = parseTriage(answer({ bodyLanguage: "en", country: "Brasil" }));
    expect(triage.language).toBe("en-us");
  });
});
