import { getViteConfig } from "astro/config";

// getViteConfig is Astro's documented way to run Vitest against a project, so
// tests resolve modules exactly like the build does.
export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node"
  }
});
