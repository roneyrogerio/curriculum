import node from "@astrojs/node";
import { defineConfig, envField } from "astro/config";

const NODE_ENV = process.env.NODE_ENV ?? "development";

export default defineConfig({
  devToolbar: {
    enabled: false
  },
  vite: {
    optimizeDeps: {
      // Pre-bundled explicitly: on demand, Vite's dev optimiser failed to serve
      // these and the tailored download died on a dynamic import.
      include: ["pdf-lib", "docx"]
    }
  },
  site: "https://roneyrogerio.dev",

  /*
   * Still a static site: every page is built to HTML at build time, and the
   * adapter exists for the two routes that opt out with `prerender = false`
   * — the tailoring panel's endpoint and nothing else. Switching `output` to
   * "server" would silently make the whole résumé render per request, which
   * would be slower and would put a Node process in the path of a page that
   * never changes between deploys.
   */
  output: "static",
  /*
   * Standalone: the adapter's own server, which also serves everything under
   * dist/client. Middleware mode is for slotting Astro into an Express or
   * Fastify app that already exists, and writing one just to host this would
   * be a server to maintain in exchange for nothing.
   *
   * `staticHeaders` remains disabled intentionally. It would serve the CSP of
   * pre-rendered pages as a header instead of a meta tag, but the adapter matches
   * routes with `pathname.includes()`, which misbehaves with trailing slashes:
   * measured in practice, the home page received a CSP whose hashes belonged to another
   * page — and a CSP with the wrong hash does not warn, it simply blocks the script.
   *
   * As meta, the policy is written directly into each page, ensuring it is always
   * its own. What is lost is `frame-ancestors`, ignored in meta by specification,
   * which is already handled via X-Frame-Options.
   */
  adapter: node({ mode: "standalone" }),

  security: {
    /*
     * Which hostnames may speak for this site, and over what.
     *
     * Astro checks the Origin header of a form POST against the URL it computed
     * for the request, and refuses when they differ. Behind Cloudflare they
     * always differ: TLS ends at the edge, so the pod is handed plain HTTP and
     * computes `http://…`, while the browser sends `https://…`. Every
     * submission came back "Cross-site POST form submissions are forbidden".
     *
     * `x-forwarded-proto` carries the truth, and Astro only trusts it for hosts
     * named here — an allowlist, because a forwarded header is written by
     * whoever is in front and can be forged by anyone the proxy does not stop.
     * The protocol has to be stated, or the forwarded one is ignored.
     */
    allowedDomains: [
      { hostname: "roneyrogerio.dev", protocol: "https" },
      { hostname: "localhost", protocol: "http" }
    ]
  },

  /*
   * `security.csp` stays off, and the policy lives in src/middleware.ts.
   *
   * It looks like the better choice: a hash per inline script instead of
   * allowing them all. But Astro only hashes the scripts it processes, and
   * this site has one that has to be `is:inline` — the script that reads the
   * stored theme before the first paint, so the page does not flash white
   * before turning dark. Processed, it becomes a deferred module and the flash
   * comes back.
   *
   * Measured on a build with the option on: not one inline script appeared in
   * the policy, on any page. A CSP with a missing hash does not warn. It
   * blocks the script, and the page arrives broken.
   */

  env: {
    schema: {
      /*
       * `access: "secret"` keeps this out of the client bundle by construction
       * rather than by convention: importing it from anywhere that ships to a
       * browser is a build error, not a leak discovered later. It is injected
       * in production from a Kubernetes Secret, so it is never in the image.
       */
      OPENAI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      /*
       * One model per call, because the three perform distinct tasks:
       * - Triage: reads the posting cheaply to extract metadata (default: gpt-5-nano)
       * - Tailor: reasons over candidate facts and adapts the résumé (default: gpt-5.6-luna)
       * - Salary: searches the web for current market compensation bands (default: gpt-5.6-luna)
       *
       * Previously only the tailoring model was configurable while the other
       * two were hardcoded in code. Now all three have defaults matching their
       * established behavior and can be overridden independently via environment
       * variables without redeploying code.
       */
      OPENAI_TRIAGE_MODEL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "gpt-5-nano"
      }),
      OPENAI_TAILOR_MODEL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "gpt-5.6-luna"
      }),
      OPENAI_SALARY_MODEL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "gpt-5.6-luna"
      })
    },
    /*
     * Validated when the server starts, not when the image is built: the key
     * lives in the cluster, and a build that demanded it would either fail in
     * CI or have to be fed a dummy value, which is how dummy values end up in
     * production.
     */
    validateSecrets: false
  }
});
