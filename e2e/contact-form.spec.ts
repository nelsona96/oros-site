import { test, expect } from "@playwright/test";

test("contact form submits successfully with the network call mocked", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/contact");

  await page.getByLabel("Name").fill("Jamie Rivera");
  await page.getByLabel("Email").fill("jamie@example.com");
  await page
    .getByLabel("Message")
    .fill("We're planning a fall wedding and would love to talk about coverage.");

  await page.getByRole("combobox", { name: "Type of shoot" }).click();
  await page.getByRole("option", { name: "Wedding" }).click();

  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText(/message sent/i)).toBeVisible();
});
