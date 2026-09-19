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
   * `staticHeaders` fica desligado de propósito. Ele serviria o CSP das
   * páginas pré-renderizadas como header em vez de meta, mas o adapter casa a
   * rota com `pathname.includes()`, e com barra final isso erra: medido, a
   * home recebia um CSP cujos hashes eram de outra página — e um CSP com o
   * hash errado não avisa, apenas bloqueia o script.
   *
   * Como meta, a política é escrita dentro da própria página, então é sempre
   * a dela. O que se perde é `frame-ancestors`, ignorado em meta por
   * especificação, e que já vai como X-Frame-Options.
   */
  adapter: node({ mode: "standalone" }),

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
      OPENAI_MODEL: envField.string({
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
