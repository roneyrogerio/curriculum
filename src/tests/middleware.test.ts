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
    const response = await run("/_actions/tailor", { "Cache-Control": "private, max-age=1" });
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=1");
  });

  it("keeps the policy closed everywhere the relaxation is not needed", () => {
    /*
     * `script-src 'unsafe-inline'` exists for one reason — the script that
     * reads the theme before the first paint has to be inline — and the price
     * is that everything else stays shut. Relax `default-src` or `object-src`
     * by accident and the script's relaxation stops being contained.
     */
    const csp = SECURITY_HEADERS["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("connect-src 'self'");
    // The relaxation is the script's alone: nothing loads from another origin.
    expect(csp).not.toContain("script-src 'unsafe-eval'");
    expect(csp).not.toMatch(/default-src[^;]*\*/);
  });
});
