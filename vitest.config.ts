import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // e2e/ is Playwright's own test suite (its `test` import isn't Vitest's)
    // — exclude it explicitly rather than relying on Vitest's default
    // excludes, which don't know about this project's own directory layout.
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
