import { expect, test } from "@playwright/test";

/**
 * UI-W3 / UI-W5 — product app routes + Wave 1–2 deep smoke.
 */
test.describe("UI-W3 product routes", () => {
  test("consultation page uses booking Field + rail + stage", async ({
    page,
  }) => {
    await page.goto("/consultation");
    await expect(
      page.getByRole("heading", { name: /Book a consultation/i }),
    ).toBeVisible();
    await expect(page.getByText(/1 · Slot/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Pick a time slot/i }),
    ).toBeVisible();
    await expect(page.locator("[data-booking-rail]")).toBeVisible();
    await expect(page.locator("[data-booking-stage]")).toBeVisible();
  });

  test("store catalog desk + product deep path", async ({ page }) => {
    await page.goto("/store");
    await expect(
      page.getByRole("heading", { name: /Zeemkolo store/i }),
    ).toBeVisible();
    await expect(page.getByText(/^Shop$/i).first()).toBeVisible();
    await expect(page.locator("[data-store-desk]")).toBeVisible();

    const viewProduct = page.getByRole("link", { name: /View product/i }).first();
    if (await viewProduct.count()) {
      await expect(page.locator("[data-store-rail]")).toBeVisible();
      await expect(page.locator("[data-store-stage]")).toBeVisible();
      await viewProduct.click();
      await expect(page).toHaveURL(/\/store\/[^/]+$/);
      await expect(page.locator("[data-store-stage]")).toBeVisible();
    }

    await page.goto("/store/checkout");
    await expect(
      page.getByRole("heading", { name: /Complete your order/i }),
    ).toBeVisible();
    await expect(page.locator("[data-store-stage]")).toBeVisible();
  });

  test("forum desk + thread deep path", async ({ page }) => {
    await page.goto("/forum");
    await expect(
      page.getByRole("heading", { name: "Zeemble forum", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Recent threads/i }),
    ).toBeVisible();
    await expect(page.locator("[data-forum-desk]")).toBeVisible();

    const openThread = page.getByRole("link", { name: /Open thread/i }).first();
    if (await openThread.count()) {
      await expect(page.locator("[data-forum-rail]")).toBeVisible();
      await openThread.click();
      await expect(page).toHaveURL(/\/forum\/threads\//);
      await expect(page.locator("[data-forum-stage]")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Join the discussion/i }),
      ).toBeVisible();
    }
  });

  test("zeemble course library rail + stage", async ({ page }) => {
    await page.goto("/zeemble");
    await expect(
      page.getByRole("heading", { name: /Course library/i }),
    ).toBeVisible();
    await expect(page.getByText(/^Zeemble Program$/i).first()).toBeVisible();

    const catalog = page.locator("[data-library-catalog]");
    if (await catalog.count()) {
      await expect(page.locator("[data-library-rail]")).toBeVisible();
      await expect(page.locator("[data-library-stage]")).toBeVisible();

      const overview = page.getByRole("link", { name: /Overview/i }).first();
      if (await overview.count()) {
        await overview.click();
        await expect(page).toHaveURL(/\/zeemble\/courses\//);
        await expect(page.locator("[data-library-rail]")).toBeVisible();

        const start = page
          .getByRole("link", { name: /Continue to first lesson|Start/i })
          .first();
        if (await start.count()) {
          await start.click();
          await expect(page).toHaveURL(/\/zeemble\/courses\/.+\/.+/);
          await expect(page.locator("[data-lesson-desk]")).toBeVisible();
        }
      }
    }
  });
});
