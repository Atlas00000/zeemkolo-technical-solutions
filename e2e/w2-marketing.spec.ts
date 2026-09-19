import { expect, test } from "@playwright/test";

/**
 * UI-W2 — marketing surfaces smoke (hero, home sections, trust pages).
 */
test.describe("UI-W2 marketing surfaces", () => {
  test("home hero is brand-first with primary CTAs", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    await expect(main.getByText("Zeemkolo").first()).toBeVisible();
    await expect(main.getByText(/Technical Solutions/i).first()).toBeVisible();
    await expect(
      main.getByRole("heading", {
        name: /Embedded systems, hardware prototypes/i,
      }),
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: /Book a consultation/i }),
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: /Explore Zeemble/i }),
    ).toBeVisible();
  });

  test("home sections use Ledger Noir section grammar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/^Services$/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Engineering support from bench to shipment/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Hardware Prototyping/i }),
    ).toBeVisible();
    await expect(page.getByText(/^Lead engagement$/i)).toBeVisible();

    await expect(page.getByText(/^Zeemble Program$/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Learn embedded systems the way the lab teaches it/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("ZMB")).toBeVisible();
    await expect(page.getByText(/gate\.allow/i)).toBeVisible();

    await expect(page.getByText(/^Client voices$/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Trusted where the schematics meet the schedule/i,
      }),
    ).toBeVisible();

    await expect(page.getByText(/^Next step$/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Book an engineering consultation/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open booking/i }),
    ).toBeVisible();
  });

  test("privacy trust page uses page header + planes", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /^Privacy$/i })).toBeVisible();
    await expect(page.getByText(/^Legal$/i).first()).toBeVisible();
    await expect(page.getByText(/Draft · pre-cutover/i)).toBeVisible();
    await expect(page.getByText(/Account identity is handled by Clerk/i)).toBeVisible();
    await expect(page.locator("[data-legal-field]")).toBeVisible();
  });

  test("terms trust page uses page header + planes", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: /Terms of use/i }),
    ).toBeVisible();
    await expect(page.getByText(/^Legal$/i).first()).toBeVisible();
    await expect(page.getByText(/Draft · pre-cutover/i)).toBeVisible();
    await expect(
      page.getByText(/Do not share matric codes or download tokens/i),
    ).toBeVisible();
    await expect(page.locator("[data-legal-field]")).toBeVisible();
  });

  test("footer links to privacy, terms, and UI system", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /^Privacy$/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /^Terms$/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /UI system/i })).toBeVisible();
  });
});
