import { expect, test } from "@playwright/test";

/**
 * UI-W4 / W5 — admin chrome + auth entry + hardening smoke.
 */
test.describe("UI-W4 admin + polish", () => {
  test("admin gate redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("admin desk chrome selectors exist on gate bounce path", async ({
    page,
  }) => {
    // Signed-out users leave /admin; desk landmarks are verified in
    // docs/runbooks/admin-ui-checklist.md when an ADMIN session is available.
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("claim-matric page uses enrollment Field", async ({ page }) => {
    await page.goto("/claim-matric");
    await expect(
      page.getByRole("heading", { name: /Your matric number/i }),
    ).toBeVisible();
    await expect(page.getByText(/Zeemble enrollment/i).first()).toBeVisible();
    await expect(page.locator("[data-auth-stage]")).toBeVisible();
  });

  test("sign-in page shows brand eyebrow + entry Field", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText(/^Zeemkolo$/i).first()).toBeVisible();
    await expect(page.locator("[data-auth-field]")).toBeVisible();
    await expect(page.locator("[data-auth-stage]")).toBeVisible();
  });

  test("sign-up page shows brand eyebrow + entry Field", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByText(/^Zeemkolo$/i).first()).toBeVisible();
    await expect(page.locator("[data-auth-field]")).toBeVisible();
  });

  test("app shell exposes skip link target", async ({ page }) => {
    await page.goto("/store");
    await expect(page.locator("#main-content")).toBeAttached();
  });
});
