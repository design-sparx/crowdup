import {expect, test} from "@playwright/test";

// Signed-out visitors are redirected to login, with the page as `next`.
// The signed-in donor needs E2E_DONOR_PASSWORD (the demo password, see docs/demo.md) and the
// seed in supabase/seed.sql, which links Dana's confirmed donations to her account.

test("signed-out visitors are sent to login with a safe next", async ({page}) => {
    await page.goto("/dashboard/donations");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fdonations/);
});

test("a signed-in donor sees only their own donations", async ({page}) => {
    test.skip(!process.env.E2E_DONOR_PASSWORD, "set E2E_DONOR_PASSWORD (see docs/demo.md)");
    await page.goto("/login?next=%2Fdashboard%2Fdonations");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("dana@crowdup.example");
    await page.getByLabel("Password", {exact: true}).fill(process.env.E2E_DONOR_PASSWORD ?? "");
    await page.getByRole("button", {name: "Sign in"}).click();
    await expect(page).toHaveURL(/\/dashboard\/donations/);
    await expect(page.getByRole("heading", {level: 1, name: "My donations"})).toBeVisible();
    // Dana's two confirmed donations are listed, and nobody else's donor details appear.
    const table = page.getByRole("table", {name: "My donations"});
    await expect(table.getByRole("row")).toHaveCount(3); // header + Dana's 2 confirmed donations
    await expect(page.getByText("kofi@crowdup.example")).toHaveCount(0);
    await expect(page.getByText("dana@crowdup.example")).toHaveCount(0);
});
