import {expect, test} from "@playwright/test";

// NOT RUN: needs a local Supabase with supabase/seed.sql applied.

test("a guest can report a live campaign", async ({page}) => {
    await page.goto("/campaigns/community-kitchen-ealing");
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
