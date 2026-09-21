/**
 * Addresses for a file that travels away from the site.
 *
 * `src/data` writes the certificates as `/certificados/x.pdf`, and that is the
 * right address for a page: the browser resolves it against wherever the site
 * is being served, so the same link works on localhost and in production
 * without anything knowing the domain.
 *
 * A downloaded file has nothing to resolve it against. A PDF reader handed
 * `/certificados/x.pdf` opens nothing, and Word reads it as a path on the
 * disk of whoever received the file. The seven such links — the diploma and
 * the six short courses — were dead in every PDF and DOCX the build wrote,
 * and alive on the site, which is why it took a recruiter's copy to notice.
 *
 * So the domain is added on the way out, in the two exporters, rather than
 * baked into the data where it would follow the page around as well.
 */
import { siteUrl } from "../data/site";

/** The same address, resolvable by something that is not a browser. */
export function absoluteHref(href: string): string {
  // A protocol-relative address already names a host; only a rooted path is
  // missing one. `mailto:` and `tel:` need no host and must be left alone.
  return href.startsWith("/") && !href.startsWith("//") ? `${siteUrl}${href}` : href;
}
