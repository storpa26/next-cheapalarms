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

  test("dashboard mock shows portal actions", async ({ page }) => {
    await page.goto("/dashboard?__mock=1");
    await expect(page.getByText(/open portal/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /resend invite/i })).toBeVisible();
  });

  test("theme toggle switches to dark mode", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /toggle dark mode/i });
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("portal requires estimate id", async ({ page }) => {
    await page.goto("/portal");
    await expect(page.getByText(/estimateid is required/i)).toBeVisible();
  });

  test("portal mock renders data", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&locationId=LOC&__mock=1");
    await expect(page.getByText(/estimate test/i)).toBeVisible();
    await expect(page.getByText(/invite pending/i)).toBeVisible();
  });
});

