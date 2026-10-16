import {expect, test} from "@playwright/test";

test("a visitor can open the home page", async ({page}) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/CrowdUp/i);
    await expect(page.getByRole("heading", {name: /more people more impact/i})).toBeVisible();

    // TODO(ticket 13): the home page still renders JSON mocks. Once it lists
    // campaigns from the seeded Supabase database, assert that seeded campaigns
    // are visible here.
});
