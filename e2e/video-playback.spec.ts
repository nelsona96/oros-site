import { test, expect } from "@playwright/test";

test("a video card opens the overlay and playback actually starts", async ({ page }) => {
  await page.goto("/portfolio/videos");

  const firstCard = page.locator('main a[href^="/portfolio/videos/"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const player = dialog.locator("mux-player");
  await expect(player).toBeVisible();

  // media-chrome (mux-player's underlying controls) renders a real button
  // with an accessible name in its open shadow DOM, which Playwright's role
  // queries pierce automatically.
  await dialog.getByRole("button", { name: /^play$/i }).click();

  await expect
    .poll(async () => player.evaluate((el) => (el as HTMLVideoElement).paused), { timeout: 15_000 })
    .toBe(false);
});
