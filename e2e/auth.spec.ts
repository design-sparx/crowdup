// NOT RUN: no Playwright harness exists on this branch yet (ticket #11 adds it).
// Excluded from Vitest (its include is src/**) and from tsc (include is src). When the
// harness lands, adjust this file and run it against `supabase start` with
// SUPABASE_URL / SUPABASE_ANON_KEY set and email confirmation off (supabase/config.toml).
import {expect, test} from "@playwright/test";

test("sign up, reload, sign out, sign in", async ({page}) => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = "correct-horse-battery";

    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/); // session survives reload

    await page.context().clearCookies(); // stands in for sign out until the UI test drives the menu
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", {name: "Sign in"}).click();
    await expect(page).toHaveURL(/\/dashboard/);
});
