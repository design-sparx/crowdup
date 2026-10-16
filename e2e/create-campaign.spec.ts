import {expect, test} from "@playwright/test";

test("an organiser creates a draft, edits it, and another user cannot open it", async ({page, browser}) => {
    const email = `e2e-organiser-${Date.now()}@example.com`;
    const password = "correct-horse-battery";

    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Organiser");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("textbox", {name: "Password"}).fill(password);
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/create-campaign");
    await page.getByLabel("Title").fill("E2E clean water");
    await page.getByRole("combobox", {name: "Category"}).click();
    await page.getByRole("option", {name: "Environment"}).click();
    await page.getByRole("combobox", {name: "Country"}).click();
    await page.getByRole("option", {name: "Kenya"}).click();
    await page.getByLabel("Goal amount").fill("2500");
    // Currency comes from the organiser's Stripe account, so it is not editable here.
    await expect(page.getByLabel("Currency")).toBeDisabled();
    await page.locator(".tiptap").click();
    await page.keyboard.type("Our story starts here.");
    await page.getByRole("button", {name: "Save draft"}).click();

    await expect(page).toHaveURL(/\/campaigns\/[0-9a-f-]+\/edit\?saved=1/);
    await expect(page.getByText("Draft saved.")).toBeVisible();
    await expect(page.getByLabel("Title")).toHaveValue("E2E clean water");
    const editUrl = page.url();

    await page.getByLabel("Title").fill("E2E clean water (edited)");
    await page.getByRole("button", {name: "Save changes"}).click();
    await expect(page.getByLabel("Title")).toHaveValue("E2E clean water (edited)");

    // A draft is not public.
    const anon = await (await browser.newContext()).newPage();
    expect((await anon.goto("/campaigns/e2e-clean-water"))?.status()).toBe(404);

    // Another signed-in user gets a 404 for the edit page.
    const other = await (await browser.newContext()).newPage();
    await other.goto("/signup");
    await other.getByLabel("Name").fill("Other User");
    await other.getByLabel("Email").fill(`e2e-other-${Date.now()}@example.com`);
    await other.getByRole("textbox", {name: "Password"}).fill(password);
    await other.getByRole("button", {name: "Sign up"}).click();
    await expect(other).toHaveURL(/\/dashboard/);
    expect((await other.goto(editUrl))?.status()).toBe(404);
});
