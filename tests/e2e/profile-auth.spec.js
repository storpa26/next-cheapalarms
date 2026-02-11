import { test, expect } from "@playwright/test";

test.describe("profile page and auth flows", () => {
  test("profile page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin/profile");
    // Should redirect to /login (requireAdmin guard)
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("admin pages redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout API clears session and returns ok", async ({ request }) => {
    const response = await request.post("/api/auth/logout");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("GET /api/auth/me returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get("/api/auth/me");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("POST /api/auth/me returns 405 method not allowed", async ({ request }) => {
    const response = await request.post("/api/auth/me");
    expect(response.status()).toBe(405);
  });

  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("quote request success page renders correctly", async ({ page }) => {
    await page.goto("/quote-request/success");
    await expect(page.getByText(/quote request submitted/i)).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
