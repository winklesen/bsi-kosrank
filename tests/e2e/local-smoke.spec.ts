import { expect, test } from "@playwright/test";

test("public pages open and exploration is reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "KosRank - Beranda" }).first()).toBeVisible();

  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "Eksplor Pilihan Tempat Kos" })).toBeVisible();
});

test("seeded user can sign in and reach profile from dashboard", async ({ page }) => {
  test.skip(process.env.E2E_TEST_SEEDED !== "1", "Requires the local sample seed");

  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");
  await page.locator("#login-email").fill("user@kosrank.com");
  await page.locator("#login-password").fill("user123");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/profile$/);
});
