// NOT RUN: needs a local Supabase (`supabase start`, migrations applied, email confirmation
// off) with SUPABASE_URL / SUPABASE_ANON_KEY set, and a production build (`pnpm build`).
// Also needs a live campaign: drafts are published by the server (Stripe onboarding), so
// set E2E_LIVE_EDIT_URL to the edit URL of a live campaign owned by E2E_EMAIL / E2E_PASSWORD.
import {expect, test} from "@playwright/test";

const editUrl = process.env.E2E_LIVE_EDIT_URL;

test.skip(!editUrl, "needs a seeded live campaign");

test("an organiser posts an update (escaped) and closes the campaign", async ({page}) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_EMAIL ?? "");
    await page.getByRole("textbox", {name: "Password"}).fill(process.env.E2E_PASSWORD ?? "");
    await page.getByRole("button", {name: /log in|sign in/i}).click();
    await page.goto(editUrl!);

    await page.getByLabel("Post an update").fill("<b>Thank you</b> all");
    await page.getByRole("button", {name: "Post update"}).click();
    await expect(page.getByText("Update posted.")).toBeVisible();
    await expect(page.getByText("<b>Thank you</b> all")).toBeVisible();

    await page.getByRole("button", {name: "Close campaign"}).click();
    await expect(page.getByText("Campaign closed.")).toBeVisible();
    await expect(page.getByText("This campaign is closed.")).toBeVisible();
});
