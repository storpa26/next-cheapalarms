import { test, expect } from "@playwright/test";

test.describe("headless surface smoke test", () => {
  test("login path renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("dashboard guards unauthenticated visitors", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});

