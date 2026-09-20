import { describe, expect, it } from "vitest";
import { bandOf, companyBandOf } from "./band";
import type { MarketObservation } from "./types";

/** A page that publishes a band, in the shape the model copies it into. */
let publisher = 0;

function source(overrides: Partial<MarketObservation> = {}): MarketObservation {
  return {
    title: "Guia salarial",
    // A publisher of its own unless a test says otherwise: the band counts one
    // reading per publisher, so sharing a URL would silently merge two sources.
    url: `https://guia-${(publisher += 1)}.com.br/salarios`,
    scope: "market",
    role: "Desenvolvedor Backend",
    level: "sênior",
    min: 12_000,
    median: 15_000,
    max: 18_000,
    currency: "BRL",
    period: "month",
    regime: "CLT",
    asOf: `${new Date().getFullYear()}`,
    ...overrides
  };
}

/** What the model wrote on its own, which is only the fallback. */
const found = {
  min: 9_000,
  median: 9_500,
  max: 10_000,
  currency: "BRL",
  period: "month",
  bandRegime: "CLT",
  pjOverClt: 1.3
};

describe("the band, as arithmetic over what the sources published", () => {
  it("takes the median of the sources rather than the model's own reading", () => {
    const band = bandOf(
      [
        source({ min: 10_000, median: 13_000, max: 16_000 }),
        source({ min: 12_000, median: 15_000, max: 18_000 }),
        source({ min: 14_000, median: 17_000, max: 20_000 })
      ],
      found
    );
    expect(band).toMatchObject({ min: 12_000, median: 15_000, max: 18_000, used: 3 });
  });

  it("gives the same answer whatever order the sources arrive in", () => {
    const pages = [
      source({ min: 10_000, median: 13_000, max: 16_000 }),
      source({ min: 12_000, median: 15_000, max: 18_000 }),
      source({ min: 14_000, median: 17_000, max: 20_000 })
    ];
    expect(bandOf(pages, found)).toEqual(bandOf([...pages].reverse(), found));
  });

  it("gives the named employer a fixed share of the answer", () => {
    const market = [
      source({ min: 12_000, median: 15_000, max: 18_000 }),
      source({ min: 12_000, median: 15_000, max: 18_000 })
    ];
    const band = bandOf(
      [...market, source({ scope: "company", min: 8_000, median: 10_000, max: 12_000 })],
      found
    );
    // 60% of the market's 15.000 and 40% of the employer's 10.000.
    expect(band.median).toBe(13_000);
  });

  it("does not let that share move with how many pages the search happened to open", () => {
    const market = [
      source({ min: 12_000, median: 15_000, max: 18_000 }),
      source({ min: 12_000, median: 15_000, max: 18_000 })
    ];
    const company = source({ scope: "company", min: 8_000, median: 10_000, max: 12_000 });

    // The measured failure: one company page found on one run, two on the
    // next, and the band lurched because each page was a vote.
    const onePage = bandOf([...market, company], found);
    const twoPages = bandOf([...market, company, company], found);

    expect(twoPages.median).toBe(onePage.median);
  });

  it("is the market alone when the posting named no employer", () => {
    const band = bandOf(
      [
        source({ min: 12_000, median: 15_000, max: 18_000 }),
        source({ min: 13_000, median: 16_000, max: 19_000 })
      ],
      found
    );
    expect(band.median).toBe(15_500);
  });

  it("is the employer alone when that is all that was found", () => {
    const band = bandOf(
      [
        source({ scope: "company", min: 10_000, median: 12_000, max: 14_000 }),
        source({ scope: "company", min: 11_000, median: 13_000, max: 15_000 })
      ],
      found
    );
    expect(band.median).toBe(12_500);
  });

  it("brings a source quoted as PJ into the band's own regime", () => {
    const band = bandOf(
      [
        source({ min: 13_000, median: 15_000, max: 17_000 }),
        // 19.500 PJ is 15.000 CLT at the 1,3 the model reported.
        source({ regime: "PJ", min: 16_900, median: 19_500, max: 22_100 })
      ],
      found
    );
    expect(band.median).toBe(15_000);
  });

  it("ignores a source quoted in another currency instead of converting it", () => {
    const band = bandOf(
      [
        source({ min: 12_000, median: 15_000, max: 18_000 }),
        source({ currency: "USD", min: 90_000, median: 120_000, max: 150_000 })
      ],
      found
    );
    // One comparable source left, which is not a market: the model's own
    // reading is used rather than a band built from a single page.
    expect(band).toMatchObject({ median: found.median, used: 1 });
  });

  it("falls back to the model's reading when nothing comparable came back", () => {
    expect(bandOf([], found)).toMatchObject({ min: 9_000, median: 9_500, max: 10_000, used: 0 });
  });

  it("rounds to what a salary guide actually publishes", () => {
    const band = bandOf(
      [
        source({ min: 12_037, median: 15_011, max: 18_049 }),
        source({ min: 12_081, median: 15_090, max: 18_003 })
      ],
      found
    );
    expect(band).toMatchObject({ min: 12_100, median: 15_100, max: 18_000 });
  });

  it("never prints a floor above its own ceiling", () => {
    const band = bandOf(
      [
        source({ min: 18_000, median: 15_000, max: 12_000 }),
        source({ min: 17_000, median: 14_000, max: 11_000 })
      ],
      found
    );
    expect(band.min).toBeLessThanOrEqual(band.median);
    expect(band.median).toBeLessThanOrEqual(band.max);
  });
});

describe("sources old enough to be about another market", () => {
  const thisYear = new Date().getFullYear();

  it("drops the guide from six years ago", () => {
    const band = bandOf(
      [
        source({ median: 15_000, min: 12_000, max: 18_000, asOf: `${thisYear}` }),
        source({ median: 15_000, min: 12_000, max: 18_000, asOf: `agosto de ${thisYear - 1}` }),
        // The measured case: a 2020 edition priced one run of this posting.
        source({ median: 9_000, min: 9_000, max: 14_000, asOf: "Estudo de Remuneração 2020" })
      ],
      found
    );
    expect(band).toMatchObject({ median: 15_000, used: 2 });
  });

  it("keeps a page that never says when its data is from", () => {
    const band = bandOf(
      [
        source({ median: 15_000, min: 12_000, max: 18_000, asOf: "não informado" }),
        source({ median: 17_000, min: 14_000, max: 20_000, asOf: "não informado" })
      ],
      found
    );
    expect(band.used).toBe(2);
  });

  it("prints an old band rather than no band, when old is all there is", () => {
    const band = bandOf(
      [
        source({ median: 9_000, min: 8_000, max: 10_000, asOf: "2019" }),
        source({ median: 11_000, min: 10_000, max: 12_000, asOf: "2020" })
      ],
      found
    );
    expect(band.used).toBe(2);
    expect(band.median).toBe(10_000);
  });
});

describe("one vote per publisher", () => {
  it("counts three pages of one site as the one methodology they are", () => {
    const glassdoor = (median: number) =>
      source({ url: `https://www.glassdoor.com.br/salarios/${median}`, median, min: median - 2_000, max: median + 2_000 });

    const band = bandOf([glassdoor(10_000), glassdoor(11_000), glassdoor(13_000)], found);
    // One reading stands for the publisher, so this is not a median of three.
    expect(band.used).toBe(1);
  });

  it("still hears the same site on the company and on the market", () => {
    const band = bandOf(
      [
        source({ url: "https://glassdoor.com.br/cargo", min: 12_000, median: 15_000, max: 18_000 }),
        source({
          url: "https://glassdoor.com.br/empresa",
          scope: "company",
          min: 8_000,
          median: 10_000,
          max: 12_000
        })
      ],
      found
    );
    // They answer different questions, so both count: 60% of 15.000 and 40%
    // of 10.000.
    expect(band).toMatchObject({ median: 13_000, used: 2 });
  });

  it("knows a subdomain is the same publisher", () => {
    const band = bandOf(
      [
        source({ url: "https://br.indeed.com/salarios/a", median: 10_000, min: 9_000, max: 11_000 }),
        source({ url: "https://www.indeed.com/salaries/b", median: 20_000, min: 19_000, max: 21_000 })
      ],
      found
    );
    expect(band.used).toBe(1);
  });
});

describe("sources that are not about this level", () => {
  it("throws out the guide that is quoting a different job", () => {
    const band = bandOf(
      [
        source({ min: 12_000, median: 15_000, max: 18_000 }),
        source({ min: 13_000, median: 16_000, max: 19_000 }),
        // A junior's salary, filed under the same three words.
        source({ title: "Robert Half", min: 6_050, median: 6_500, max: 8_000 })
      ],
      found
    );
    expect(band).toMatchObject({ median: 15_500, used: 2 });
  });

  it("keeps a market that genuinely pays a wide range", () => {
    const band = bandOf(
      [
        source({ min: 10_000, median: 12_000, max: 14_000 }),
        source({ min: 14_000, median: 16_000, max: 18_000 }),
        source({ min: 18_000, median: 22_000, max: 26_000 })
      ],
      found
    );
    expect(band.used).toBe(3);
    expect(band.median).toBe(16_000);
  });

  it("uses the sample it has rather than filtering down to a single page", () => {
    const band = bandOf(
      [
        source({ median: 5_000, min: 4_000, max: 6_000 }),
        source({ median: 15_000, min: 14_000, max: 16_000 }),
        source({ median: 40_000, min: 38_000, max: 42_000 })
      ],
      found
    );
    expect(band.used).toBe(3);
  });
});

describe("what the named employer pays, on its own", () => {
  it("is nothing when the posting named no company, or nothing was found", () => {
    expect(companyBandOf([source(), source()], found)).toBeNull();
  });

  it("keeps a single page about the company, which is all there is about it", () => {
    const band = companyBandOf(
      [source(), source({ scope: "company", min: 11_000, median: 13_000, max: 15_000 })],
      found
    );
    expect(band).toMatchObject({ min: 11_000, median: 13_000, max: 15_000, used: 1 });
  });

  it("combines two pages about the company the way the band combines sources", () => {
    const band = companyBandOf(
      [
        source({ scope: "company", min: 11_000, median: 13_000, max: 15_000 }),
        source({ scope: "company", min: 13_000, median: 15_000, max: 17_000 })
      ],
      found
    );
    expect(band).toMatchObject({ min: 12_000, median: 14_000, max: 16_000, used: 2 });
  });
});
