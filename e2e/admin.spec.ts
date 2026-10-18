import {expect, test, type Page} from "@playwright/test";

// Needs a local Supabase with the demo seed loaded (supabase/demo-seed.sql sets the public demo
// password for admin@crowdup.example). Set E2E_ADMIN_PASSWORD=demo-password-123 locally. Skipped unless set.
const password = process.env.E2E_ADMIN_PASSWORD;
test.skip(!password, "set E2E_ADMIN_PASSWORD (see docs/demo.md)");

async function signIn(page: Page, email: string) {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", {exact: true}).fill(password ?? "");
    await page.getByRole("button", {name: "Sign in"}).click();
    await page.waitForURL(/\/dashboard/);
}

test("a signed-out visitor and an organiser both get a 404 for the admin inbox", async ({page, browser}) => {
    expect((await page.goto("/admin/reports"))?.status()).toBe(404);
    expect((await page.goto("/admin/approvals"))?.status()).toBe(404);

    const organiser = await (await browser.newContext()).newPage();
    await signIn(organiser, "amara@crowdup.example");
    expect((await organiser.goto("/admin/reports"))?.status()).toBe(404);
});

test("the admin sees the inbox tabs with a count on the tabs that have work", async ({page}) => {
    await signIn(page, "admin@crowdup.example");
    await page.goto("/admin/reports");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", {level: 1, name: "Admin"})).toBeVisible();
    const nav = page.getByRole("navigation", {name: "Admin"});
    await expect(nav.getByRole("link", {name: /Reports/})).toHaveAttribute("aria-current", "page");
    // The seed has open reports and one campaign waiting for approval.
    await expect(nav.getByRole("link", {name: /Approvals/})).toContainText("1");
    await expect(nav.getByRole("link", {name: /Reports/})).toContainText(/\d/);
});

test("the approvals tab lists the campaign waiting for approval", async ({page}) => {
    await signIn(page, "admin@crowdup.example");
    await page.goto("/admin/approvals");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Books for the harbour library")).toBeVisible();
    await expect(page.getByRole("button", {name: "Approve"})).toBeVisible();
    await expect(page.getByRole("button", {name: "Reject"})).toBeVisible();
});

test("the users tab does not offer to suspend the admin's own account", async ({page}) => {
    await signIn(page, "admin@crowdup.example");
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    // The card that says "This is you." must not contain a suspend control.
    const self = page.locator("[data-slot='card']").filter({hasText: "This is you."});
    await expect(self).toHaveCount(1);
    await expect(self.getByRole("button", {name: "Suspend"})).toHaveCount(0);
    // Other accounts still offer it, so the control is not missing everywhere.
    await expect(page.getByRole("button", {name: "Suspend"}).first()).toBeVisible();
});
