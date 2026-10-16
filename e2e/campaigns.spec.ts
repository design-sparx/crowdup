import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied, and SUPABASE_URL /
// SUPABASE_ANON_KEY set for the server.

test("a visitor can browse, search and open a campaign with share metadata", async ({page}) => {
    await page.goto("/campaigns");
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    // Only live campaigns are public.
    await expect(page.getByText("Youth football kit fund")).toHaveCount(0);
    await expect(page.getByText("Quick cash for a great cause")).toHaveCount(0);

    await page.getByLabel("Search campaigns").fill("kitchen");
    await page.getByRole("button", {name: "Search"}).click();
    await expect(page).toHaveURL(/q=kitchen/);
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toHaveCount(0);

    await page.getByText("Community kitchen in Ealing").click();
    await expect(page).toHaveURL(/\/campaigns\/community-kitchen-ealing$/);
    await expect(page.getByRole("heading", {name: "Community kitchen in Ealing"})).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Community kitchen in Ealing/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /Hot meals/);
});

test("a non-live campaign is not found", async ({page}) => {
    const response = await page.goto("/campaigns/youth-football-kit");
    expect(response?.status()).toBe(404);
});
