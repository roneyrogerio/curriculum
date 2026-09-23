import { describe, expect, it } from "vitest";
import { cacheControlFor, SECURITY_HEADERS, onRequest } from "../middleware";

/*
 * These rules used to live in an NGINX conf file, where nothing could check
 * them: a deploy either carried the file or quietly did not. Here they are
 * assertions, which is most of the reason they moved.
 */
describe("caching", () => {
  it("never caches a résumé written for one posting", () => {
    expect(cacheControlFor("/print/tailor/")).toBe("no-store");
    expect(cacheControlFor("/_actions/tailor")).toBe("no-store");
  });

  it("revalidates the generated files hourly, since a build rewrites them", () => {
    expect(cacheControlFor("/cv/Roney-Oliveira-Software-Engineer-BR.pdf")).toContain("max-age=3600");
  });

  it("leaves the fingerprinted assets to the adapter", () => {
    // @astrojs/node marks /_astro/ immutable itself. Repeating the rule here
    // would make two places responsible for one decision.
    expect(cacheControlFor("/_astro/index.abc123.css")).not.toContain("immutable");
  });

  it("revalidates pages quickly", () => {
    expect(cacheControlFor("/pt-br/")).toBe("public, max-age=300, must-revalidate");
  });
});

describe("the action's own endpoint", () => {
  const post = (pathname: string) =>
    (onRequest as any)(
      { url: new URL(`https://roneyrogerio.dev${pathname}`) },
      async () => new Response("reached", { status: 200 })
    ) as Promise<Response>;

  it("does not exist, because nothing calls it", async () => {
    /*
     * The page invokes the action in process with Astro.callAction, so that
     * everything private sits under one path and one Access rule. Astro still
     * publishes /_actions/<name>, and that one is outside the rule: a scripted
     * form post would reach the model and spend the key with no login. Astro's
     * CSRF check does not stop a script, which sets Origin to whatever it likes.
     */
    expect((await post("/_actions/tailor")).status).toBe(404);
  });

  it("does not depend on the casing of the path", async () => {
    // Astro's routing is case-sensitive, so this already 404s without the rule.
    // The rule should not need that to be true.
    expect((await post("/_Actions/tailor")).status).toBe(404);
  });

  it("lets the page itself through", async () => {
    expect((await post("/print/tailor/")).status).toBe(200);
  });
});

describe("security headers", () => {
  const run = async (pathname: string, existing?: Record<string, string>) => {
    const response = new Response("ok", { headers: existing });
    const result = await (onRequest as any)(
      { url: new URL(`https://roneyrogerio.dev${pathname}`) },
      async () => response
    );
    return result as Response;
  };

  it("denies framing by header, because Astro's CSP is a meta tag", () => {
    // frame-ancestors is ignored in <meta> by specification, so the meta-tag
    // policy alone would leave the site framable.
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
  });

  it("sets every header on every response", async () => {
    const response = await run("/pt-br/");
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      expect(response.headers.get(header)).toBe(value);
    }
  });

  it("does not override caching a route chose for itself", async () => {
    const response = await run("/print/tailor/", { "Cache-Control": "private, max-age=1" });
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=1");
  });

  it("keeps the policy closed everywhere the relaxation is not needed", () => {
    /*
     * `script-src 'unsafe-inline'` exists for one reason — the script that
     * reads the theme before the first paint has to be inline — and the price
     * is that every other origin is named, one by one. Relax `default-src` or
     * `object-src` by accident, or let a directive gain a host nobody meant to
     * add, and the script's relaxation stops being contained.
     *
     * Compared as sets per directive, not as substrings: `toContain("connect-src
     * 'self'")` also passes for `connect-src 'self' https:`, which is the very
     * widening this test exists to catch.
     */
    const directives = new Map(
      SECURITY_HEADERS["Content-Security-Policy"].split(";").map((directive) => {
        const [name, ...sources] = directive.trim().split(/\s+/);
        return [name, sources.sort()] as const;
      })
    );
    const analytics = ["https://www.googletagmanager.com", "https://*.google-analytics.com"];

    // Every directive, so a new one, or a duplicate the Map would fold away, fails too.
    expect(directives.size).toBe(SECURITY_HEADERS["Content-Security-Policy"].split(";").length);
    expect(Object.fromEntries(directives)).toEqual({
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
      "img-src": ["'self'", "data:", ...analytics].sort(),
      "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"].sort(),
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"].sort(),
      "font-src": ["'self'", "https://fonts.gstatic.com"].sort(),
      "connect-src": ["'self'", ...analytics, "https://*.google.com"].sort(),
      "object-src": ["'none'"]
    });
  });
});
