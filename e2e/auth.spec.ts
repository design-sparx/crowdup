import {expect, test} from "@playwright/test";

test("sign up, reload, sign out, sign in", async ({page}) => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = "correct-horse-battery";

    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E User");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("textbox", {name: "Password"}).fill(password);
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/); // session survives reload

    await page.context().clearCookies(); // stands in for sign out until the UI test drives the menu
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

    await page.getByLabel("Email").fill(email);
    await page.getByRole("textbox", {name: "Password"}).fill(password);
    await page.getByRole("button", {name: "Sign in"}).click();
    await expect(page).toHaveURL(/\/dashboard/);
});
