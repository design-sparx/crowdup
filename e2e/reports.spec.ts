import {expect, test} from "@playwright/test";

// Needs a local Supabase with supabase/seed.sql applied.
// The report endpoint allows 5 reports per client per hour (in memory, per server process), and
// the report test here and in donate.spec.ts each send one. Running them many times against ONE
// server (for example --repeat-each) hits that limit and fails with "Too many reports". That is
// the limiter working, not a bug; each normal run starts a fresh server.

test("a guest can report a live campaign", async ({page}) => {
    await page.goto("/campaigns/community-kitchen-ealing");
    // Server-rendered buttons are inert until React has hydrated; wait for the bundle first.
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", {name: "Report campaign"}).click();
    await page.getByLabel("What is wrong with this campaign?").fill("This looks like a scam to me.");
    await page.getByRole("button", {name: "Send report"}).click();
    await expect(page.getByText("Our moderators will review your report")).toBeVisible();
});

test("guests get a 404 for the admin area", async ({page}) => {
    for (const path of ["/admin", "/admin/reports"]) {
        const response = await page.goto(path);
        expect(response?.status()).toBe(404);
        await expect(page.getByText("Open reports")).toHaveCount(0);
    }
});
