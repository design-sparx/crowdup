import {expect, test} from "@playwright/test";

// NOT RUN: requires a running local Supabase with supabase/seed.sql applied, a password for
// dana@crowdup.example, and donation rows with donor_user_id set for her.
test.skip(true, "needs local Supabase with a password for dana@crowdup.example");

test("signed-out visitors are sent to login", async ({page}) => {
    await page.goto("/dashboard/donations");
    await expect(page).toHaveURL(/\/login/);
});

test("donor sees only their own donations", async ({page}) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("dana@crowdup.example");
    await page.getByLabel("Password").fill(process.env.E2E_DONOR_PASSWORD ?? "");
    await page.getByRole("button", {name: /log in|sign in/i}).click();
    await page.goto("/dashboard/donations");
    await expect(page.getByRole("heading", {name: "My donations"})).toBeVisible();
    await expect(page.getByText("kofi@crowdup.example")).toHaveCount(0);
});
