import { expect, test, type Page } from "@playwright/test";

// Membutuhkan database contoh (prisma db seed) dan alternatif riset (prisma/seed-research.ts).
test.skip(process.env.E2E_TEST_SEEDED !== "1", "Requires the local sample seed and research alternatives");

const research = ["a01", "a02", "a03", "a04", "a05"].map((c) => `research-${c}`);

async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 45_000 });
}

test("admin sees five criteria and keeps create/delete controls", async ({ page }) => {
  await login(page, "superadmin@kosrank.com", "admin123");
  await page.goto("/admin/kriteria");
  for (const [code, name] of [["C1", "Harga"], ["C2", "Fasilitas"], ["C3", "Jarak"], ["C4", "Ukuran Ruangan"], ["C5", "Rating"]]) {
    await expect(page.getByRole("row", { name: new RegExp(`${code}\\s+${name}`) })).toBeVisible();
  }
  await expect(page.getByRole("row", { name: /^C6/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Simpan Kriteria" })).toBeVisible();
  expect(await page.locator("tbody form button[type=submit]").count()).toBeGreaterThanOrEqual(5);
  await expect(page.getByText("1.00").first()).toBeVisible();

  await page.goto("/admin/sub-kriteria");
  await expect(page.getByRole("button", { name: "Simpan Sub-Kriteria" })).toBeVisible();
  await expect(page.getByTitle("Hapus Sub Kriteria").first()).toBeVisible();
});

test("research set is calculated in isolation and matches the research ranking", async ({ page }) => {
  await login(page, "superadmin@kosrank.com", "admin123");
  await page.goto(`/admin/perhitungan?${research.map((id) => `kos=${id}`).join("&")}`);
  await expect(page.getByText("(C1 - C5)")).toBeVisible();

  // Hasil akhir (terbuka secara bawaan): urutan A04, A03, A05, A02, A01 dengan V riset.
  const rows = page.locator("table").first().locator("tbody tr");
  await expect(rows).toHaveCount(5);
  const text = (await rows.allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
  const expected = [
    ["DFlory", "0.9333"], ["Taman Bunga", "0.9000"], ["Rumah Nimas", "0.8450"],
    ["Pondok Rindang", "0.6767"], ["Noeks", "0.6150"],
  ];
  expected.forEach(([name, v], i) => {
    expect(text[i]).toContain(name);
    expect(text[i]).toContain(v);
  });

  // Matriks X dan R untuk A01 (kiri ke kanan C1..C5).
  await page.getByRole("button", { name: /2\. Matriks Keputusan/ }).click();
  await expect(page.getByRole("row", { name: /Noeks.*80\s+40\s+60\s+40\s+40/ })).toBeVisible();
  await page.getByRole("button", { name: /3\. Matriks Ternormalisasi/ }).click();
  await expect(page.getByRole("row", { name: /Noeks.*0\.7500\s+0\.5000\s+0\.6667\s+0\.6667\s+0\.4000/ })).toBeVisible();
});

test("final ranking, seller and public routes still work", async ({ page }) => {
  await login(page, "superadmin@kosrank.com", "admin123");
  for (const path of ["/admin", "/admin/hasil-akhir", "/admin/kos", "/admin/users", "/admin/perhitungan"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
  await page.context().clearCookies();
  await login(page, "seller1@kosrank.com", "seller123");
  for (const path of ["/seller", "/seller/kos"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
  for (const path of ["/", "/explore"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
});
