import { defineConfig } from "astro/config";

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
  output: "static"
});
