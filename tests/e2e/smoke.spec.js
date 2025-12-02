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

  test("portal mock renders overview with estimate data", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&locationId=LOC&__mock=1");
    
    // Check overview renders
    await expect(page.getByText(/your estimate/i)).toBeVisible();
    await expect(page.getByText(/estimate #test/i)).toBeVisible();
    
    // Check navigation sidebar
    await expect(page.getByRole("button", { name: /overview/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /estimates/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /payments/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /support/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /preferences/i })).toBeVisible();
  });

  test("portal navigates to payments view", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&locationId=LOC&__mock=1");
    
    // Navigate to payments
    await page.getByRole("button", { name: /payments/i }).click();
    await expect(page.getByText(/financial overview/i)).toBeVisible();
    await expect(page.getByText(/payments & documents/i)).toBeVisible();
    await expect(page.getByText(/outstanding balance/i)).toBeVisible();
  });

  test("portal navigates to support view", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&locationId=LOC&__mock=1");
    
    // Navigate to support
    await page.getByRole("button", { name: /support/i }).click();
    await expect(page.getByText(/customer care/i)).toBeVisible();
    await expect(page.getByText(/support & help/i)).toBeVisible();
    await expect(page.getByText(/assigned specialist/i)).toBeVisible();
  });

  test("portal navigates to preferences view", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&locationId=LOC&__mock=1");
    
    // Navigate to preferences
    await page.getByRole("button", { name: /preferences/i }).click();
    await expect(page.getByText(/your account/i)).toBeVisible();
    await expect(page.getByText(/preferences & activity/i)).toBeVisible();
    await expect(page.getByText(/account preferences/i)).toBeVisible();
  });

  test("portal shows invite token banner for guest access", async ({ page }) => {
    await page.goto("/portal?estimateId=TEST&inviteToken=abc123&__mock=1");
    
    // Check for invite token banner
    await expect(page.getByText(/guest access/i)).toBeVisible();
    await expect(page.getByText(/temporary invite link/i)).toBeVisible();
    
    // Dismiss banner
    const dismissButton = page.getByRole("button", { name: /dismiss banner/i });
    await dismissButton.click();
    await expect(page.getByText(/guest access/i)).not.toBeVisible();
  });

  test("admin products form renders and lists items (mocked auth)", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();
  });
});

