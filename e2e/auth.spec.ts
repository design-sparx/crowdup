import {expect, test, type Page} from "@playwright/test";

const password = "correct-horse-battery";

async function openLogin(page: Page, path = "/login") {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
}

test("sign up, reload, sign out, sign in", async ({page}) => {
    const email = `e2e-${Date.now()}@example.com`;

    await openLogin(page, "/signup");
    await page.getByLabel("Name").fill("E2E User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", {exact: true}).fill(password);
    await page.getByRole("checkbox", {name: /I agree to the Terms and Privacy Policy/}).check();
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/); // session survives reload

    await page.context().clearCookies(); // stands in for sign out
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

    await openLogin(page, "/login?next=%2Fdashboard");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", {exact: true}).fill(password);
    await page.getByRole("button", {name: "Sign in"}).click();
    await expect(page).toHaveURL(/\/dashboard/);
});

test("signup cannot be submitted without the consent checkbox", async ({page}) => {
    await openLogin(page, "/signup");
    await page.getByLabel("Email").fill(`e2e-consent-${Date.now()}@example.com`);
    await page.getByLabel("Password", {exact: true}).fill(password);
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/signup/);
    const box = page.getByRole("checkbox", {name: /I agree to the Terms and Privacy Policy/});
    await expect(box).toHaveAttribute("aria-required", "true");
});

test("a wrong password shows an inline error and stays on login", async ({page}) => {
    await openLogin(page);
    await page.getByLabel("Email").fill("nobody-here@example.com");
    await page.getByLabel("Password", {exact: true}).fill("wrong-password-123");
    await page.getByRole("button", {name: "Sign in"}).click();
    await expect(page.getByRole("alert")).toContainText("Invalid email or password.");
    await expect(page).toHaveURL(/\/login/);
});

test("forgot password confirms without revealing whether the account exists", async ({page}) => {
    await openLogin(page, "/forgot-password");
    await page.getByLabel("Email").fill("nobody-here@example.com");
    await page.getByRole("button", {name: "Send reset link"}).click();
    await expect(page.getByRole("status")).toContainText("If an account exists for that email");
});

test("the update password page sends signed-out visitors to login", async ({page}) => {
    await page.goto("/update-password");
    await expect(page).toHaveURL(/\/login\?next=%2Fupdate-password/);
});
