/**
 * The security and caching headers.
 *
 * NGINX used to send these. When the site gained a Node process for its one
 * on-demand route, keeping NGINX in front of it would have meant two servers
 * to keep in step about which paths exist, so what was still missing moved
 * here — and only what was still missing:
 *
 * - `/_astro/` immutable caching is the Node adapter's, which sets it for the
 *   assets directory itself, so it is not repeated here.
 *
 * A caveat worth knowing, because it is invisible: this runs for on-demand
 * routes only. A prerendered page is answered by the adapter's static handler
 * before the application is reached, so these headers do not apply to the
 * public site — that is the CDN's layer, and `deploy/cloudflare.md` has the
 * same list, as a Cloudflare rule, verified by `npm run verify:headers`.
 */
import type { MiddlewareHandler } from "astro";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  /*
   * `script-src 'unsafe-inline'` is the one relaxation here, and it is
   * deliberate: the page reads the stored theme from an inline script before
   * the first paint, and Astro's alternative — a hash per script — does not
   * cover `is:inline`, which is exactly what that script has to be. See
   * astro.config.mjs.
   *
   * The relaxation stays contained by `default-src 'self'`: nothing may be
   * fetched, connected to or framed from elsewhere, and `object-src 'none'`
   * closes plugins.
   */
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "object-src 'none'"
  ].join("; ")
};

/** Rewritten by every build from `src/data`, so revalidated hourly. */
const GENERATED = /^\/cv\//;
/** A résumé written for one posting is never the answer to another request. */
const PRIVATE = /^\/(_actions|print\/tailor)\b/;

export function cacheControlFor(pathname: string): string {
  if (PRIVATE.test(pathname)) return "no-store";
  if (GENERATED.test(pathname)) return "public, max-age=3600";
  return "public, max-age=300, must-revalidate";
}

/**
 * The action's own endpoint, which nothing here calls.
 *
 * Astro publishes `/_actions/<name>` for every action, whether or not anything
 * uses it. The tailoring page does not: it invokes the action in process with
 * `Astro.callAction`, so that everything private sits under one path and one
 * Cloudflare Access rule.
 *
 * Left alone, that endpoint is a second door to the same room, and it is
 * outside the rule: a scripted form post reaches the model and spends the key,
 * with no session and no login. Astro's own CSRF check does not stop it —
 * comparing Origin to the request URL only protects against a browser, which
 * sets Origin honestly; a script sets whatever it likes.
 *
 * So the door is bricked up rather than guarded. 404, not 403: a refusal that
 * says "this exists but you may not" is an invitation to keep trying.
 */
/*
 * Case-insensitive on purpose. Astro's own routing is case-sensitive, so
 * /_Actions/tailor already 404s — but that is a guarantee borrowed from
 * somebody else's behaviour, and this rule should hold on its own.
 */
const ACTION_ENDPOINT = /^\/_actions\//i;

export const onRequest: MiddlewareHandler = async (context, next) => {
  if (ACTION_ENDPOINT.test(context.url.pathname)) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS }
    });
  }

  const response = await next();

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  // Not overwritten: a route that set its own caching meant to.
  if (!response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", cacheControlFor(context.url.pathname));
  }

  return response;
};
