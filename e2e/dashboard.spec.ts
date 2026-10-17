import {expect, test} from "@playwright/test";

// NOT RUN: requires a running Supabase with supabase/seed.sql applied, and SUPABASE_URL /
// SUPABASE_ANON_KEY set for the server. The default seed users have no passwords. Either
// apply supabase/demo-seed.sql (public demo password, local use only) and set
// E2E_ORGANISER_PASSWORD=demo-password-123, or set your own. Skipped unless the variable is set.
test.skip(!process.env.E2E_ORGANISER_PASSWORD, "set E2E_ORGANISER_PASSWORD (see docs/demo.md)");

test("organiser sees only their campaigns, with edit links and anonymous donors masked", async ({page}) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("amara@crowdup.example");
    await page.getByRole("textbox", {name: "Password"}).fill(process.env.E2E_ORGANISER_PASSWORD ?? "");
    await page.getByRole("button", {name: /log in|sign in/i}).click();
    await page.goto("/dashboard");

    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await expect(page.getByText("Youth football kit fund")).toBeVisible();
    await expect(page.getByText("draft", {exact: true})).toBeVisible();
    await expect(page.getByText("Community kitchen in Ealing")).toHaveCount(0);
    await expect(page.getByRole("link", {name: "Edit Youth football kit fund"})).toBeVisible();
    await expect(page.getByRole("cell", {name: "Anonymous"})).toBeVisible();
    await expect(page.getByText("dana@crowdup.example")).toHaveCount(0);
});
