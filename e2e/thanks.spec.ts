import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied and the env from .env.local.
const SLUG = "/campaigns/community-kitchen-ealing";

test("the thank-you page thanks the donor without claiming a donation or showing an amount", async ({page}) => {
    await page.goto(`${SLUG}/thanks`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", {level: 1, name: "Thank you"})).toBeVisible();
    await expect(page.getByText(/Community kitchen in Ealing/).first()).toBeVisible();
    await expect(page.getByText(/recorded|receipt/i)).toHaveCount(0);
    await expect(page.getByRole("link", {name: "View my donations"})).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Copy link"})).toBeVisible();
});

test("the thank-you page links back to the campaign", async ({page}) => {
    await page.goto(`${SLUG}/thanks`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", {name: "Back to the campaign"}).click();
    await expect(page).toHaveURL(new RegExp(`${SLUG}$`));
    await expect(page.getByRole("heading", {level: 1, name: "Community kitchen in Ealing"})).toBeVisible();
});

test("an unknown campaign's thank-you page is a real 404", async ({page}) => {
    const response = await page.goto("/campaigns/no-such-campaign-xyz/thanks");
    expect(response?.status()).toBe(404);
});
test("the thank-you share links point at the campaign page, not the thank-you page", async ({page}) => {
    await page.goto(`${SLUG}/thanks`);
    await page.waitForLoadState("networkidle");
    const whatsapp = page.getByRole("link", {name: "WhatsApp"});
    await expect(whatsapp).toHaveAttribute("href", /community-kitchen-ealing/);
    await expect(whatsapp).not.toHaveAttribute("href", /thanks/);
});
