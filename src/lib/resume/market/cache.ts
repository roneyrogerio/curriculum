/**
 * The same posting, looked up once.
 *
 * Regenerating a résumé while tweaking it is the normal way to use the panel,
 * and the band does not move between two attempts five minutes apart — but the
 * search is billed per call and dominates the bill. So the answer is kept for
 * a week, which is far shorter than a salary guide's own update cycle.
 *
 * In memory, and therefore per pod and lost on deploy. That is the right size
 * for this: a miss costs a couple of cents. It is worth being clear about what
 * this does and does not buy, because it is easy to expect the wrong thing
 * from it — it stops the same posting being paid for twice; it is not what
 * makes two lookups agree. That is `band.ts`, and it had to be, because a
 * cache only ever freezes whichever answer happened to come back first.
 */
import { createHash } from "node:crypto";
import type { MarketQuery, MarketSalary } from "./types";

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX = 50;

const entries = new Map<string, { at: number; value: MarketSalary }>();

const keyOf = (query: MarketQuery) =>
  createHash("sha256").update(query.cacheKey).digest("hex");

export function cached(query: MarketQuery): MarketSalary | null {
  const hit = entries.get(keyOf(query));
  if (!hit || Date.now() - hit.at >= TTL_MS) return null;

  // Usage zeroed: this lookup was paid for once, and reporting it again would
  // make a cached generation look like it cost what the first did.
  return { ...hit.value, usage: { inputTokens: 0, cachedTokens: 0, outputTokens: 0, searches: 0 } };
}

export function remember(query: MarketQuery, value: MarketSalary): void {
  // Oldest out first: insertion order is what Map iterates, and a week-old
  // entry is the one least likely to be asked for again.
  if (entries.size >= MAX) entries.delete(entries.keys().next().value!);
  entries.set(keyOf(query), { at: Date.now(), value });
}
