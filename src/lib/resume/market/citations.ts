/**
 * The pages the answer says it read, tidied into a list worth clicking.
 *
 * Two lists come back from one search and they overlap: the `url_citation`
 * annotations attached to the text, and the pages the search tool reports
 * having consulted. Merged naively, the same article appears twice, because
 * the annotation carries a tracking parameter the other one does not:
 *
 *   .../Hotmart-Engenheiro-De-Software-Sênior-...htm?filter=...&utm_source=openai
 *   .../Hotmart-Engenheiro-De-Software-Sênior-...htm?filter=...
 *
 * Measured on a real lookup: six entries, of which two were that one page.
 * Every assistant tags its own referral traffic this way, so the parameter is
 * noise about us rather than about the page, and two of our own entries is a
 * list that looks careless.
 *
 * The bigger problem is that the engine's list is every page it opened on the
 * way, including the ones it glanced at and threw away. That is where the dead
 * links come from, and one from a real lookup shows why:
 *
 *   .../Hotmart-Senior-Software-Developer-Salários-E1139514_D_KO8,33.htm
 *
 * Nothing is wrong with that address — the `KO8,33` points exactly at
 * `Senior-Software-Developer` inside the slug, as Glassdoor's own scheme
 * requires. The page simply does not exist: that employer has its salaries
 * filed under another job title. The engine opened it, found nothing, and
 * moved on; we were printing it as a source of the figure.
 *
 * Citations cannot be the answer either, tempting as it looks. This lookup
 * answers in Structured Outputs, and a model writing strict JSON has nowhere
 * to put an inline citation, so the annotations arrive empty far more often
 * than not — which is exactly why `action.sources` had to be asked for in the
 * first place. A list that filtered on citations would show one source on one
 * run and six on the next.
 *
 * So the list is the intersection of two things that are checkable: the pages
 * the engine really opened, and the pages the answer says it copied figures
 * from. The second is `observations`, which is not decoration — `bandOf` reads
 * it to compute the band on screen, so these are literally the sources of the
 * number beside them. Requiring both sides also contains the one risk of
 * trusting `observations` alone, which is that its URLs are written by the
 * model and an unvisited page is an invented one.
 *
 * What none of this does is repair a link. A link that 404s came back that
 * way from the search — roughly one citation in a hundred does — and guessing
 * at a replacement would be inventing a source, which is the one thing a list
 * of sources must never do.
 */

/** Written by whoever sent the traffic, and says nothing about the page. */
const TRACKING = /^(utm_[a-z_]+|gclid|fbclid|mc_cid|mc_eid|igshid|si)$/i;

/**
 * The same page, spelled the same way, so two of it can be seen as one.
 *
 * Percent-encoding is left exactly as it arrived. It is already correct —
 * `Sal%C3%A1rio` is "Salário" in UTF-8, which is what a URL must carry — and
 * decoding it to look tidier would produce an address that is a different
 * string and, for a server that cares, a different page.
 */
export function normaliseCitationUrl(raw: string): string {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    /* Not a URL we can take apart: hand it back untouched rather than guess. */
    return trimmed;
  }

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING.test(key)) url.searchParams.delete(key);
  }

  /*
   * A text fragment points at a phrase inside the page. Harmless to follow,
   * but it is the search engine's highlighting rather than the page's address,
   * and it makes one page look like several.
   */
  if (url.hash.startsWith("#:~:text=")) url.hash = "";

  return url.toString();
}

/** The publisher, for a link whose own title never arrived. */
export function labelFor(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export interface Source {
  title: string;
  url: string;
}

/**
 * Collects both lists into one, keyed by the tidied address.
 *
 * A titled entry wins over an untitled one for the same page: the annotation
 * carries the headline the publisher wrote, and the tool's own list often
 * carries nothing, which is how a bare URL ended up as its own link text.
 */
/** A page the answer copied figures from, as `observations` records it. */
interface Cited {
  title?: unknown;
  url?: unknown;
}

/**
 * The pages that were both opened and used, titled as the answer titles them.
 *
 * Falls back rather than showing nothing: an answer with no usable
 * observations still had pages opened, and a panel with no sources at all
 * invites more trust than one whose links can be checked.
 */
export function sourcesFor(output: any[], observations: Cited[]): Source[] {
  const opened = collectSources(output);
  if (opened.length === 0) return [];

  const byUrl = new Map(opened.map((source) => [source.url, source]));
  const used = new Map<string, Source>();

  for (const observation of observations ?? []) {
    if (typeof observation?.url !== "string") continue;
    const url = normaliseCitationUrl(observation.url);
    const opened = byUrl.get(url);
    if (!opened) continue;

    const title =
      typeof observation.title === "string" && observation.title.trim()
        ? observation.title.trim()
        : opened.title;
    used.set(url, { title, url });
  }

  return used.size > 0 ? [...used.values()] : opened;
}

export function collectSources(output: any[]): Source[] {
  const into = (sources: Map<string, Source>) => (rawUrl: unknown, rawTitle: unknown) => {
    if (typeof rawUrl !== "string" || !rawUrl.trim()) return;
    const url = normaliseCitationUrl(rawUrl);
    const title = typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : "";

    const held = sources.get(url);
    if (held && (held.title !== labelFor(url) || !title)) return;
    sources.set(url, { title: title || labelFor(url), url });
  };

  const sources = new Map<string, Source>();
  const add = into(sources);

  const parts = output
    .filter((item: any) => item?.type === "message")
    .flatMap((item: any) => item?.content ?? []);
  for (const part of parts) {
    for (const annotation of part?.annotations ?? []) {
      if (annotation?.type === "url_citation") add(annotation.url, annotation.title);
    }
  }
  for (const item of output) {
    for (const source of item?.sources ?? item?.action?.sources ?? []) {
      add(source?.url ?? source, source?.title);
    }
  }

  return [...sources.values()];
}
