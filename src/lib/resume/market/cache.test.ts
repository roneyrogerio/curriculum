import { afterEach, describe, expect, it, vi } from "vitest";
import { cached, remember } from "./cache";
import type { MarketQuery, MarketSalary } from "./types";

const query = (cacheKey: string, language = "Português (Brasil)"): MarketQuery => ({
  language,
  summary: "Backend sênior em Go, Brasil, remoto",
  role: "Desenvolvedor Backend Sênior",
  country: "Brasil",
  actualLevel: "sênior",
  company: "Frete.com",
  fit: 70,
  fitNote: "Go em produção",
  cacheKey
});

const band = (median: number) =>
  ({
    median,
    usage: { inputTokens: 20_000, cachedTokens: 0, outputTokens: 900, searches: 2 }
  }) as unknown as MarketSalary;

afterEach(() => vi.useRealTimers());

describe("the week-long memo on a lookup", () => {
  it("hands back what the same posting cost a search to learn", () => {
    remember(query("a"), band(15_000));
    expect(cached(query("a"))?.median).toBe(15_000);
  });

  it("serves the same posting pasted with different spacing", () => {
    remember(query("Backend sênior\n\nGo,  Brasil"), band(15_000));
    expect(cached(query("Backend sênior\nGo, Brasil "))?.median).toBe(15_000);
  });

  it("treats a changed word as another job, because it is one", () => {
    remember(query("Backend sênior Go"), band(15_000));
    expect(cached(query("Backend pleno Go"))).toBeNull();
  });

  it("keeps one posting's two languages apart, because the prose differs", () => {
    remember(query("a", "Français"), band(15_000));
    expect(cached(query("a", "Español"))).toBeNull();
    expect(cached(query("a", "Français"))?.median).toBe(15_000);
  });

  it("reports a cached lookup as having cost nothing, because it did", () => {
    remember(query("b"), band(15_000));
    expect(cached(query("b"))?.usage).toEqual({
      inputTokens: 0,
      cachedTokens: 0,
      outputTokens: 0,
      searches: 0
    });
  });

  it("knows nothing about a posting it has not seen", () => {
    expect(cached(query("never-asked"))).toBeNull();
  });

  it("lets an entry go stale rather than quoting last month's market", () => {
    vi.useFakeTimers();
    remember(query("c"), band(15_000));

    vi.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);
    expect(cached(query("c"))).not.toBeNull();

    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
    expect(cached(query("c"))).toBeNull();
  });

  it("drops the oldest rather than growing without a bound", () => {
    remember(query("first"), band(1_000));
    for (let index = 0; index < 60; index += 1) remember(query(`filler-${index}`), band(2_000));

    expect(cached(query("first"))).toBeNull();
    expect(cached(query("filler-59"))?.median).toBe(2_000);
  });
});
