import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied, and SUPABASE_URL /
// SUPABASE_ANON_KEY set for the server (see .env.local).

test("a visitor can browse, search and open a campaign", async ({page}) => {
    await page.goto("/campaigns");
    await expect(page.getByRole("heading", {name: "Browse campaigns"})).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    // Only live campaigns are public.
    await expect(page.getByText("Youth football kit fund")).toHaveCount(0);
    await expect(page.getByText("Quick cash for a great cause")).toHaveCount(0);

    await page.getByLabel("Search campaigns").fill("kitchen");
    await page.getByRole("search").getByRole("button", {name: "Search"}).click();
    await expect(page).toHaveURL(/q=kitchen/);
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toHaveCount(0);

    await page.getByText("Community kitchen in Ealing").click();
    await expect(page).toHaveURL(/\/campaigns\/community-kitchen-ealing$/);
    await expect(page.getByRole("heading", {name: "Community kitchen in Ealing", level: 1})).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Community kitchen in Ealing/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /Hot meals/);
});

test("a visitor can filter by category and clear the filter", async ({page}) => {
    await page.goto("/campaigns");
    await page.getByRole("combobox", {name: "Category"}).selectOption("Food");
    await page.getByRole("search").getByRole("button", {name: "Search"}).click();
    await expect(page).toHaveURL(/category=Food/);
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toHaveCount(0);

    await page.getByRole("link", {name: "Clear filters"}).click();
    await expect(page).toHaveURL(/\/campaigns$/);
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
});

test("a search with no matches shows an empty state with a way back", async ({page}) => {
    await page.goto("/campaigns?q=zzzzqqqq");
    await expect(page.getByText("No campaigns found")).toBeVisible();
    await page.getByRole("link", {name: "Show all campaigns"}).click();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
});

test("a page number beyond the results shows the empty state, not an error", async ({page}) => {
    const response = await page.goto("/campaigns?page=99");
    expect(response?.status()).toBe(200);
    await expect(page.getByText("No campaigns found")).toBeVisible();
});

test("the home page shows featured campaigns and leads to the list", async ({page}) => {
    await page.goto("/");
    await expect(page.getByRole("heading", {level: 1, name: "Raise money for what matters"})).toBeVisible();
    await expect(page.getByRole("heading", {name: "Featured campaigns"})).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await page.getByRole("link", {name: "Donate to a campaign"}).click();
    await expect(page).toHaveURL(/\/campaigns$/);
});

test("a non-live campaign is not found", async ({page}) => {
    const response = await page.goto("/campaigns/youth-football-kit");
    expect(response?.status()).toBe(404);
});
