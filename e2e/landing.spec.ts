import { test, expect } from "@playwright/test";

test("landing page loads, hero renders, and primary nav works", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Oros Productions/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Oros Productions");

  await page.getByRole("banner").getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/portfolio\/photos$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Photography, in full.");
});
