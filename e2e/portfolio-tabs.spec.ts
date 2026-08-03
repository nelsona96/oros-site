import { test, expect } from "@playwright/test";

test("portfolio tab toggle switches between photos and videos", async ({ page }) => {
  await page.goto("/portfolio/photos");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Photography, in full.");

  await page.getByRole("link", { name: "Videos" }).click();
  await expect(page).toHaveURL(/\/portfolio\/videos$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Film, in full.");

  await page.getByRole("link", { name: "Photos" }).click();
  await expect(page).toHaveURL(/\/portfolio\/photos$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Photography, in full.");
});
