import {expect, test} from "@playwright/test";

// NOT RUN: needs a local Supabase with supabase/seed.sql applied.

test("guests get a 404 for the moderation pages", async ({page}) => {
    for (const path of ["/admin/campaigns", "/admin/users"]) {
        const response = await page.goto(path);
        expect(response?.status()).toBe(404);
    }
});
