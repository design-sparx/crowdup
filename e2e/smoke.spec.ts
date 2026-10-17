import {expect, test} from "@playwright/test";

test("the home page has the site header and footer", async ({page}) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("link", {name: "Browse"})).toBeVisible();
    await expect(page.getByRole("link", {name: "Terms"})).toBeVisible();
});

test("an unknown path is a real 404 with a way home", async ({page}) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", {name: "Page not found"})).toBeVisible();
    await expect(page.getByRole("link", {name: "Back to home"})).toBeVisible();
});

test("the theme choice survives a reload", async ({page}) => {
    await page.goto("/");
    await page.getByRole("button", {name: "Toggle theme"}).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
});
