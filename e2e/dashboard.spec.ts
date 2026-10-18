import {expect, test} from "@playwright/test";

// Needs a running Supabase with the demo seed loaded (supabase/demo-seed.sql sets the public demo
// password). Set E2E_ORGANISER_PASSWORD=demo-password-123 locally. Skipped unless the variable is set.
test.skip(!process.env.E2E_ORGANISER_PASSWORD, "set E2E_ORGANISER_PASSWORD (see docs/demo.md)");

test("organiser sees their own campaigns on the dashboard, and no other organiser's", async ({page}) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("amara@crowdup.example");
    await page.getByLabel("Password", {exact: true}).fill(process.env.E2E_ORGANISER_PASSWORD ?? "");
    await page.getByRole("button", {name: "Sign in"}).click();

    // Wait for the dashboard itself, not just the URL: the heading only appears once it has rendered.
    await expect(page.getByRole("heading", {level: 1, name: /Welcome, Amara/})).toBeVisible();
    const table = page.getByRole("table", {name: "Your campaigns"});
    await expect(table.getByRole("link", {name: "Edit Clean water for Kibera schools"})).toBeVisible();
    await expect(table.getByRole("link", {name: "Edit Youth football kit fund"})).toBeVisible();
    await expect(table.getByText("draft", {exact: true})).toBeVisible();
    // Another organiser's campaign must never appear here.
    await expect(page.getByText("Community kitchen in Ealing")).toHaveCount(0);
    // Donor emails never reach the dashboard.
    await expect(page.getByText("dana@crowdup.example")).toHaveCount(0);
});
