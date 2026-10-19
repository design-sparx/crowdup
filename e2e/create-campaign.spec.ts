import {expect, test, type Page} from "@playwright/test";

const password = "correct-horse-battery";

async function signUp(page: Page, name: string, email: string) {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", {exact: true}).fill(password);
    await page.getByRole("checkbox", {name: /I agree to the Terms and Privacy Policy/}).check();
    await page.getByRole("button", {name: "Sign up"}).click();
    await expect(page).toHaveURL(/\/dashboard/);
}

test("an organiser creates a draft through the guided steps, and another user cannot open it", async ({page, browser}) => {
    const email = `e2e-organiser-${Date.now()}@example.com`;
    await signUp(page, "E2E Organiser", email);

    await page.goto("/create-campaign");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", {level: 1, name: "Create a campaign"})).toBeVisible();

    // Step 1: basics
    await page.getByLabel("Title").fill("E2E clean water");
    await page.getByLabel("Category").selectOption("Environment");
    await page.getByLabel("Country").selectOption("KE");
    await page.getByLabel("Summary").fill("A short summary.");
    await page.getByRole("button", {name: "Next"}).click();

    // Step 2: story. The editor is the real Tiptap editor, so type into it.
    await page.locator(".tiptap").click();
    await page.keyboard.type("Our story starts here.");
    await page.getByRole("button", {name: "Next"}).click();

    // Step 3: goal. Currency is read-only.
    await page.getByLabel("Goal amount").fill("2500");
    await expect(page.getByLabel("Currency")).toBeDisabled();
    await page.getByRole("button", {name: "Next"}).click();

    // Step 4: preview shows what was typed, rendered from the server.
    // The story text also sits in the editor on the story step, so check the preview article itself.
    const preview = page.getByRole("article");
    await expect(preview.getByRole("heading", {level: 2, name: "E2E clean water"})).toBeVisible();
    await expect(preview.getByText("Our story starts here.")).toBeVisible();
    await page.getByRole("button", {name: "Save draft"}).click();

    // The save redirects to the edit page. That page is still a placeholder until Task 13, so this
    // spec stops at the redirect and does not assert on its contents yet.
    await expect(page).toHaveURL(/\/campaigns\/[0-9a-f-]+\/edit\?saved=1/);
    const editUrl = page.url();

    // A draft is not public.
    const anon = await (await browser.newContext()).newPage();
    expect((await anon.goto("/campaigns/e2e-clean-water"))?.status()).toBe(404);

    // Another signed-in user gets a 404 for the edit page.
    const other = await (await browser.newContext()).newPage();
    await signUp(other, "Other User", `e2e-other-${Date.now()}@example.com`);
    expect((await other.goto(editUrl))?.status()).toBe(404);
});

test("a server error sends the organiser back to the step holding the first bad field", async ({page}) => {
    await signUp(page, "E2E Errors", `e2e-errors-${Date.now()}@example.com`);
    await page.goto("/create-campaign");
    await page.waitForLoadState("networkidle");

    // Fill the basics correctly, but leave the goal empty so the server rejects the save.
    await page.getByLabel("Title").fill("E2E error path");
    await page.getByLabel("Category").selectOption("Other");
    await page.getByLabel("Country").selectOption("GB");
    await page.getByRole("button", {name: "Next"}).click();
    await page.getByRole("button", {name: "Next"}).click();
    await page.getByRole("button", {name: "Next"}).click();
    await page.getByRole("button", {name: "Save draft"}).click();

    // The goal error is on the goal step, so the page opens there with the message.
    await expect(page.getByLabel("Goal amount")).toBeVisible();
    await expect(page.getByText(/Enter a goal greater than zero/)).toBeVisible();
});
