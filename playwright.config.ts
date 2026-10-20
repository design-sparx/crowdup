import {defineConfig, devices} from "@playwright/test";

const PORT = 4173;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [["github"], ["html", {open: "never"}]] : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "on-first-retry",
    },
    projects: [{name: "chromium", use: {
            ...devices["Desktop Chrome"],
            // Optional: use an already-installed Chromium instead of the Playwright download.
            launchOptions: {executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined},
        },
    }],
    // Serves the production build. Run `pnpm build` first.
    webServer: {
        command: "pnpm exec react-router-serve ./build/server/index.js",
        url: `http://localhost:${PORT}`,
        // The e2e suite exercises the signup flow; the production default is off.
        env: {PORT: String(PORT), AUTH_SIGNUP_ENABLED: "true"},
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
