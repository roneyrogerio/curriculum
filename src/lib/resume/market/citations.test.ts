import { describe, expect, it } from "vitest";
import { collectSources, labelFor, normaliseCitationUrl, sourcesFor } from "./citations";

/** The shape the Responses API returns, reduced to what the collector reads. */
const payload = (annotations: unknown[], sources: unknown[]) => [
  { type: "web_search_call", action: { sources } },
  { type: "message", content: [{ type: "output_text", text: "{}", annotations }] }
];

const GLASSDOOR =
  "https://www.glassdoor.com.br/Sal%C3%A1rio/Hotmart-Engenheiro-De-Software-S%C3%AAnior-Sal%C3%A1rios-E1139514_DAO.htm?filter.jobTitleExact=Engenheiro+De+Software+S%C3%AAnior";

describe("tidying a cited address", () => {
  it("drops the tag the assistant added about itself", () => {
    expect(normaliseCitationUrl(`${GLASSDOOR}&utm_source=openai`)).toBe(GLASSDOOR);
  });

  it("leaves percent-encoding exactly as it arrived, because it is already right", () => {
    expect(normaliseCitationUrl(GLASSDOOR)).toContain("Sal%C3%A1rio");
    expect(normaliseCitationUrl(GLASSDOOR)).toContain("S%C3%AAnior");
  });

  it("keeps the parameters that name the page, and drops only the trackers", () => {
    const tidied = normaliseCitationUrl(`${GLASSDOOR}&gclid=x&selectedLocationString=M%2C3132`);
    expect(tidied).toContain("filter.jobTitleExact=");
    expect(tidied).toContain("selectedLocationString=M%2C3132");
    expect(tidied).not.toContain("gclid");
  });

  it("drops a search engine's text highlight, which is not the page's address", () => {
    expect(normaliseCitationUrl("https://e.com/guia#:~:text=s%C3%AAnior")).toBe("https://e.com/guia");
  });

  it("hands back untouched anything it cannot take apart", () => {
    expect(normaliseCitationUrl("nao é uma url")).toBe("nao é uma url");
  });
});

describe("the list of pages shown to the candidate", () => {
  it("shows one page once, however many lists it came back in", () => {
    const found = collectSources(
      payload(
        [{ type: "url_citation", title: "Glassdoor — Hotmart", url: `${GLASSDOOR}&utm_source=openai` }],
        [{ url: GLASSDOOR }]
      )
    );

    expect(found).toHaveLength(1);
    expect(found[0].url).toBe(GLASSDOOR);
    // The publisher's own headline, which only the annotation carried.
    expect(found[0].title).toBe("Glassdoor — Hotmart");
  });

  it("names a titleless page by its publisher instead of printing the address", () => {
    const [source] = collectSources(payload([], [{ url: "https://br.indeed.com/viewjob?jk=abc" }]));
    expect(source.title).toBe("br.indeed.com");
  });



  it("ignores an entry with no address at all", () => {
    expect(collectSources(payload([{ type: "url_citation", title: "x" }], [{ title: "y" }]))).toEqual([]);
  });
});

describe("naming a publisher", () => {
  it("uses the host without the www", () => {
    expect(labelFor("https://www.glassdoor.com.br/a")).toBe("glassdoor.com.br");
  });
});

describe("the pages a figure can be traced to", () => {
  const DEAD =
    "https://www.glassdoor.com.br/Sal%C3%A1rio/Hotmart-Senior-Software-Developer-Sal%C3%A1rios-E1139514_D_KO8%2C33.htm";

  const opened = payload([], [{ url: GLASSDOOR }, { url: DEAD }]);

  it("leaves out a page the engine opened and the answer never used", () => {
    // Real: that address is well formed, and Glassdoor files this employer's
    // salaries under another job title, so the page does not exist.
    const found = sourcesFor(opened, [{ title: "Glassdoor", url: GLASSDOOR }]);
    expect(found).toEqual([{ title: "Glassdoor", url: GLASSDOOR }]);
  });

  it("matches the two sides through the same tidying, tracking tag and all", () => {
    const found = sourcesFor(opened, [{ title: "Glassdoor", url: `${GLASSDOOR}&utm_source=openai` }]);
    expect(found.map((source) => source.url)).toEqual([GLASSDOOR]);
  });

  it("drops a page the answer claims to have read but the engine never opened", () => {
    // The URLs in `observations` are written by the model; one that was never
    // visited is one that was invented.
    const found = sourcesFor(opened, [{ title: "Inventado", url: "https://inventado.com/guia" }]);
    expect(found.map((source) => source.url)).toEqual([GLASSDOOR, DEAD]);
  });

  it("keeps the pages opened when the answer recorded no usable observation", () => {
    expect(sourcesFor(opened, []).map((source) => source.url)).toEqual([GLASSDOOR, DEAD]);
  });

  it("shows nothing when the search opened nothing", () => {
    expect(sourcesFor(payload([], []), [{ title: "x", url: GLASSDOOR }])).toEqual([]);
  });
});
