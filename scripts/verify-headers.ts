/**
 * Checks a running site for the headers that are not the application's.
 *
 * The security headers on prerendered pages are a Cloudflare Transform Rule,
 * because Astro's middleware never sees those requests. A rule in a dashboard
 * is exactly the kind of configuration that is deleted by someone tidying up
 * and missed for a year, so this asserts it from outside, against whatever URL
 * it is pointed at.
 *
 *   npm run verify:headers -- https://roneyrogerio.dev
 */
import { SECURITY_HEADERS } from "../src/middleware.ts";

const target = process.argv[2] ?? "https://roneyrogerio.dev";

const response = await fetch(new URL("/pt-br/", target), { redirect: "follow" });
let failed = 0;

for (const [header, expected] of Object.entries(SECURITY_HEADERS)) {
  const found = response.headers.get(header);
  const ok = found === expected;
  if (!ok) failed += 1;
  console.log(`${ok ? " OK " : "FALHA"}  ${header}: ${found ?? "ausente"}`);
}

console.log(failed === 0 ? `\nTodos os headers em ${target}` : `\n${failed} header(s) faltando em ${target}`);
process.exit(failed === 0 ? 0 : 1);
