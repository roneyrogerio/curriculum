/**
 * Exchange rates, from the European Central Bank.
 *
 * These used to be searched for, along with the salary band, and it was the
 * worst of both: a web search costs a cent a call and came back with the quote
 * inverted — a band of R$ 12.400 converted to US$ 63.760, multiplied by 5.14
 * instead of divided by it. A rate is a published number, not a judgement, and
 * asking a model to find one buys uncertainty at a price.
 *
 * Frankfurter serves the ECB's daily reference rates, free and without a key.
 * It is cached for the day because that is how often the source moves, and a
 * failure is not fatal: the panel falls back to the band's own currency rather
 * than showing a converted figure it cannot stand behind.
 */
const ENDPOINT = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL,EUR";

export interface Rates {
  /** How many reais buy one dollar — the USD/BRL pair, as it is published. */
  usdBrl: number;
  /** How many reais buy one euro. */
  eurBrl: number;
  /** The ECB reference date, so the screen can say how fresh this is. */
  date: string;
}

let cached: { rates: Rates; day: string } | null = null;

/** A rate outside this is a misread, not a market: the dollar is not worth two
 *  cents, and it is not worth two hundred reais. */
const plausible = (rate: number) => Number.isFinite(rate) && rate > 0.5 && rate < 50;

export async function exchangeRates(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch
): Promise<Rates | null> {
  const today = new Date().toISOString().slice(0, 10);
  if (cached?.day === today) return cached.rates;

  try {
    const response = await fetchImpl(ENDPOINT, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return cached?.rates ?? null;

    const payload: any = await response.json();
    const usdBrl = payload?.rates?.BRL;
    const usdEur = payload?.rates?.EUR;
    if (!plausible(usdBrl) || !Number.isFinite(usdEur) || usdEur <= 0) {
      return cached?.rates ?? null;
    }

    // The feed quotes everything against the dollar; the euro leg is the ratio.
    const rates: Rates = {
      usdBrl,
      eurBrl: usdBrl / usdEur,
      date: typeof payload?.date === "string" ? payload.date : today
    };
    cached = { rates, day: today };
    return rates;
  } catch {
    // Stale rates beat no rates, and no rates beat a wrong number.
    return cached?.rates ?? null;
  }
}
