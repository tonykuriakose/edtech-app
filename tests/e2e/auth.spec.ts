import { test, expect } from "@playwright/test";

// These tests use the seed account created in prisma/seed.ts
// Make sure the dev server is running and the DB is seeded before running.

test.describe("Authentication flows", () => {
  test("login page renders the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("valid credentials land on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@cognify.dev");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard", { timeout: 15_000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("wrong password stays on the login page and shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@cognify.dev");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    // Should NOT navigate away
    await expect(page).not.toHaveURL("/dashboard");
    await expect(page.getByText("Invalid email or password")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("register page renders the create-account form", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Create account" })
    ).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("new user can register and lands on dashboard", async ({ page }) => {
    const unique = `testuser${Date.now()}@playwright.test`;
    await page.goto("/register");
    await page.locator("#name").fill("Playwright Tester");
    await page.locator("#email").fill(unique);
    await page.locator("#password").fill("playwrightpass");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("/dashboard", { timeout: 20_000 });
    await expect(page).toHaveURL("/dashboard");
  });
});
