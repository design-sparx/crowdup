import {expect, test} from "@playwright/test";

// Signed-out visitors are redirected to login, with the page as `next`.
// The signed-in test is added after the sign-in screens exist (Task 8); the seed does not yet
// link donor rows to a user (donor_user_id is null), so a signed-in donor would see no rows.

test("signed-out visitors are sent to login with a safe next", async ({page}) => {
    await page.goto("/dashboard/donations");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fdonations/);
});
