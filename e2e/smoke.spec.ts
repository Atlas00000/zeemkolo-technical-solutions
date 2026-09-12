import { expect, test } from "@playwright/test";

/**
 * O5.2 — critical-path smoke (public marketing + gated admin).
 * Does not require a running API for static headings; LMS/store tolerate empty/error states.
 */
test.describe("critical path smoke", () => {
  test("home page shows brand hero signal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    // Brand should appear as a strong first-viewport signal (nav and/or hero).
    await expect(page.getByText(/Zeemkolo/i).first()).toBeVisible();
  });

  test("consultation booking page", async ({ page }) => {
    await page.goto("/consultation");
    await expect(
      page.getByRole("heading", { name: /Book a consultation/i }),
    ).toBeVisible();
  });

  test("LMS / Zeemble catalog preview", async ({ page }) => {
    await page.goto("/zeemble");
    await expect(
      page.getByRole("heading", { name: /Course library/i }),
    ).toBeVisible();
  });

  test("store catalog", async ({ page }) => {
    await page.goto("/store");
    await expect(
      page.getByRole("heading", { name: /Zeemkolo store/i }),
    ).toBeVisible();
  });

  test("admin gate redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    // Clerk protect → sign-in (or account portal) rather than Operations dashboard.
    await expect(page).not.toHaveURL(/\/admin$/);
    const url = page.url();
    expect(
      /sign-in|clerk|accounts\.dev|login/i.test(url) ||
        !url.includes("/admin"),
    ).toBe(true);
  });

  test("privacy and terms stubs are linked", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy/i })).toBeVisible();
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: /Terms of use/i }),
    ).toBeVisible();
  });
});
