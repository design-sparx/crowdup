import {expect, test, type Page} from "@playwright/test";
import {caption, clearCaption} from "./caption";

const PASSWORD = "demo-password-123";
const CAMPAIGN = "/campaigns/clean-water-kibera-schools";
const MANAGE = "/campaigns/10000000-0000-4000-8000-000000000001/edit";

async function signIn(page: Page, email: string) {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", {exact: true}).fill(PASSWORD);
    await page.getByRole("button", {name: "Sign in"}).click();
    await page.waitForURL(/\/(dashboard|admin)/);
    await page.waitForLoadState("networkidle");
}

async function signOut(page: Page) {
    await page.context().clearCookies();
}

test.describe.configure({mode: "serial"});

test("CrowdUp, end to end: the donor, organiser and admin journeys", async ({page}) => {
    test.setTimeout(600000);

    // Intro
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await caption(page, "CrowdUp: donation crowdfunding. This recording walks the three journeys: donor, organiser and admin.", 3000);

    // 1. Donor
    await caption(page, "1 · Donor: browse live campaigns, no account needed.");
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await caption(page, "Each campaign shows its goal and progress.");
    await page.goto(CAMPAIGN);
    await page.waitForLoadState("networkidle");
    await caption(page, "The campaign page carries the story, updates and a donate panel on the page itself.", 2500);
    await page.getByRole("button", {name: /50\.00/}).first().click();
    await caption(page, "Choosing a preset fills the amount. Payment goes to Stripe Checkout, so a card is never entered here.", 2500);
    await page.goto(`${CAMPAIGN}?donation=cancelled`);
    await page.waitForLoadState("networkidle");
    await caption(page, "If a payment is cancelled, the donor is told they were not charged and can try again.", 2500);
    await page.goto(`${CAMPAIGN}/thanks`);
    await page.waitForLoadState("networkidle");
    await caption(page, "After paying, the donor lands on a thank-you page that shares the campaign, not a receipt.", 2500);

    // Donor account
    await caption(page, "Donors who sign in see their own donation history.");
    await signIn(page, "dana@crowdup.example");
    await page.goto("/dashboard/donations");
    await page.waitForLoadState("networkidle");
    await caption(page, "My donations: only this donor's own confirmed gifts.", 2500);
    await signOut(page);

    // 2. Organiser
    await caption(page, "2 · Organiser: sign in, see the next step, manage the campaign.");
    await signIn(page, "amara@crowdup.example");
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", {level: 1, name: /Welcome/})).toBeVisible();
    await caption(page, "The dashboard shows the next step, the totals, the last 30 days and every campaign.", 2800);
    await page.goto(MANAGE);
    await page.waitForLoadState("networkidle");
    await caption(page, "Manage a campaign: edit the details, post an update to supporters, and see donors.", 2800);
    // Typed but not posted, so the recording does not add rows to the shared demo seed.
    await page.getByLabel("Post an update").fill("Thank you to everyone who gave this week.");
    await caption(page, "Updates are plain text; the server limits their length. Posting is left out of this recording.", 2600);
    await page.getByRole("button", {name: "Close campaign"}).click();
    await caption(page, "Closing a campaign asks first, and only closes it once the organiser confirms.", 2500);
    await page.getByRole("button", {name: "Keep it open"}).click();
    await signOut(page);

    await caption(page, "Creating a campaign is a guided flow: basics, story, goal, then a preview of exactly what will publish.", 2800);
    await signIn(page, "amara@crowdup.example");
    await page.goto("/create-campaign");
    await page.waitForLoadState("networkidle");
    await caption(page, "Connecting Stripe is the step before publishing. Donations are paid straight to the organiser.", 2800);
    await signOut(page);

    // 3. Admin
    await caption(page, "3 · Admin: one inbox with reports, approvals, payments, campaigns and users.");
    await signIn(page, "admin@crowdup.example");
    await page.goto("/admin/reports");
    await page.waitForLoadState("networkidle");
    await caption(page, "Tabs show a count for everything waiting.", 2500);
    await page.goto("/admin/approvals");
    await page.waitForLoadState("networkidle");
    await caption(page, "Approvals: a campaign waits here until an admin approves or rejects it.", 2500);
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await caption(page, "An admin never sees a suspend button on their own account.", 2500);
    await signOut(page);

    await page.goto("/login");
    await caption(page, "Signed out, the admin inbox returns a plain 404, so the area does not reveal itself.", 2500);
    await page.goto("/admin/reports");
    await caption(page, "Guests and organisers get the same 404.", 2000);

    await page.goto("/");
    await caption(page, "Thanks for watching. Every step shown runs against the production build.", 3000);
    await clearCaption(page);
});
