import {expect, test} from "@playwright/test";

// Needs local Supabase with the demo seed loaded, so Amara owns a live campaign. Set
// E2E_ORGANISER_PASSWORD=demo-password-123 (see docs/demo.md). Skipped unless it is set.
// The approval-mode path (a live edit returns to pending) needs PUBLISHING_MODE=approval and is
// covered by the lifecycle unit tests instead.
const password = process.env.E2E_ORGANISER_PASSWORD;
const editUrl = "/campaigns/10000000-0000-4000-8000-000000000001/edit";

test.skip(!password, "set E2E_ORGANISER_PASSWORD (see docs/demo.md)");

async function signInAsAmara(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("amara@crowdup.example");
    await page.getByLabel("Password", {exact: true}).fill(password ?? "");
    await page.getByRole("button", {name: "Sign in"}).click();
    await page.waitForURL(/\/dashboard/);
}

test("an organiser posts an update, and it is stored as plain text", async ({page}) => {
    await signInAsAmara(page);
    await page.goto(editUrl);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", {level: 1, name: "Clean water for Kibera schools"})).toBeVisible();

    await page.getByLabel("Post an update").fill("<b>Thank you</b> all");
    await page.getByRole("button", {name: "Post update"}).click();
    // The update is shown as text, not rendered as HTML.
    await expect(page.getByText("<b>Thank you</b> all")).toBeVisible();
});

test("an over-length update is rejected by the server with its message", async ({page}) => {
    await signInAsAmara(page);
    await page.goto(editUrl);
    await page.waitForLoadState("networkidle");
    // The textarea has a maxlength, so the browser cannot send an over-length update. Post it straight
    // to the server, so the server's own limit is what rejects it, and read the message it returns.
    const message = await page.evaluate(async (body) => {
        const form = new URLSearchParams({intent: "post-update", body});
        const res = await fetch(window.location.pathname, {method: "POST", body: form, headers: {accept: "application/json"}});
        return {status: res.status, text: await res.text()};
    }, "x".repeat(5001));
    expect(message.status).toBeGreaterThanOrEqual(400);
    expect(message.text).toContain("Updates can be at most 5000 characters.");
});

test("closing asks for confirmation and does not close until confirmed", async ({page}) => {
    await signInAsAmara(page);
    await page.goto(editUrl);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", {name: "Close campaign"}).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();
    await page.getByRole("button", {name: "Keep it open"}).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    // Still open: the close control is still offered.
    await expect(page.getByRole("button", {name: "Close campaign"})).toBeVisible();
});
