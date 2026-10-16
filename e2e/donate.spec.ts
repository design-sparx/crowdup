// NOT RUN: needs a local Supabase with the seed, a production build, STRIPE_SECRET_KEY (test
// mode) and a campaign whose organiser has a real connected test account. It only checks
// the part before Stripe: the form posts and the browser lands on checkout.stripe.com.
// Set E2E_DONATE_CAMPAIGN_URL to that campaign's page.
import {expect, test} from "@playwright/test";

const campaignUrl = process.env.E2E_DONATE_CAMPAIGN_URL;
test.skip(!campaignUrl, "needs a live campaign with a connected Stripe test account");

test("a guest can start a donation and is sent to Stripe Checkout", async ({page}) => {
    await page.goto(campaignUrl!);
    await page.getByRole("button", {name: "Donate", exact: true}).first().click();
    await page.getByLabel(/Amount/).fill("10");
    await page.getByLabel("Your name (optional)").fill("E2E Donor");
    await page.getByRole("button", {name: "Donate now"}).click();
    await page.waitForURL(/checkout\.stripe\.com/);
});

test("the donation form rejects an invalid amount", async ({page}) => {
    await page.goto(campaignUrl!);
    await page.getByRole("button", {name: "Donate", exact: true}).first().click();
    await page.getByLabel(/Amount/).fill("0.10");
    await page.getByRole("button", {name: "Donate now"}).click();
    await expect(page.getByRole("alert")).toContainText(/at least/i);
});
