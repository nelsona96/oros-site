import { defineConfig, devices } from "@playwright/test";

/**
 * Set PLAYWRIGHT_BASE_URL to point specs at a real deploy (a Vercel preview
 * or production) instead of a locally-built server — this is what "Done
 * when: all four specs pass against a preview deploy" (BUILD_PLAN.md Phase
 * 15) actually runs against. `webServer` is skipped in that case: there's
 * nothing local to boot, and Playwright would otherwise wait on a port that
 * never opens.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // A production build, not `next dev` — CLAUDE.md's own testing
        // gotcha notes `next dev`'s unminified Turbopack bundle can behave
        // differently from what actually ships; E2E specs should exercise
        // the real thing.
        command: "npm run build && npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
