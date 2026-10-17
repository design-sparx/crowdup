import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied and SUPABASE_URL /
// SUPABASE_ANON_KEY set (see .env.local). The first two tests stop before Stripe.
// The test that reaches Checkout needs a campaign whose organiser has a connected Stripe
// test account: set E2E_DONATE_CAMPAIGN_URL to that campaign's page to run it.

const SLUG = "/campaigns/community-kitchen-ealing";

test("the campaign page shows the story, the money summary and a donate form on the page", async ({page}) => {
    await page.goto(SLUG);
    await expect(page.getByRole("heading", {level: 1, name: "Community kitchen in Ealing"})).toBeVisible();
    await expect(page.getByRole("form", {name: "Donate"})).toBeVisible();
    await expect(page.getByRole("button", {name: "Donate now"})).toBeVisible();
    await expect(page.getByText(/funded/)).toBeVisible();
});

test("choosing a preset fills the amount, and an invalid amount shows the server's error", async ({page}) => {
    await page.goto(SLUG);
    // The seeded campaign is in GBP, so the preset is labelled with a pound sign.
    await page.getByRole("button", {name: /50\.00/}).first().click();
    await expect(page.getByLabel(/^Amount/)).toHaveValue("50");
    await page.getByLabel(/^Amount/).fill("0.10");
    await page.getByRole("button", {name: "Donate now"}).click();
    await expect(page.getByRole("alert")).toContainText(/at least/i);
});

test("a cancelled payment shows a notice and the form is still usable", async ({page}) => {
    await page.goto(`${SLUG}?donation=cancelled`);
    await expect(page.getByText(/You have not been charged/)).toBeVisible();
    await expect(page.getByRole("button", {name: "Donate now"})).toBeEnabled();
});

test("the tabs switch between story, updates and donors", async ({page}) => {
    await page.goto(SLUG);
    await page.getByRole("tab", {name: /Updates/}).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await page.getByRole("tab", {name: /Donors/}).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
});

test("a guest can report a campaign", async ({page}) => {
    await page.goto(SLUG);
    await page.getByRole("button", {name: "Report campaign"}).click();
    await page.getByLabel("What is wrong with this campaign?").fill("This looks like a scam to me.");
    await page.getByRole("button", {name: "Send report"}).click();
    await expect(page.getByText("Our moderators will review your report")).toBeVisible();
});

const stripeCampaign = process.env.E2E_DONATE_CAMPAIGN_URL;
test("a guest can start a donation and is sent to Stripe Checkout", async ({page}) => {
    test.skip(!stripeCampaign, "needs a live campaign with a connected Stripe test account");
    await page.goto(stripeCampaign!);
    await page.getByLabel(/^Amount/).fill("10");
    await page.getByLabel("Your name (optional)").fill("E2E Donor");
    await page.getByRole("button", {name: "Donate now"}).click();
    await page.waitForURL(/checkout\.stripe\.com/);
});