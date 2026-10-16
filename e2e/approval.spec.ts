import {expect, test} from "@playwright/test";

// NOT RUN: needs a local Supabase with supabase/seed.sql applied.

test("guests get a 404 for the approval queue", async ({page}) => {
    const response = await page.goto("/admin/approvals");
    expect(response?.status()).toBe(404);
});
