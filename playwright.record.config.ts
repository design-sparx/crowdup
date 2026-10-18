import {defineConfig, devices} from "@playwright/test";

// Records the whole system as video, from the production build (not the dev server).
// Run `pnpm build` first, then `pnpm record`. Output goes to recordings/.
const PORT = 4173;

export default defineConfig({
    testDir: "./recordings-src",
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: "list",
    outputDir: "./recordings/output",
    use: {
        baseURL: `http://localhost:${PORT}`,
        viewport: {width: 1280, height: 800},
        video: {mode: "on", size: {width: 1280, height: 800}},
        launchOptions: {executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined},
    },
    projects: [{name: "recording", use: {...devices["Desktop Chrome"], viewport: {width: 1280, height: 800}}}],
    webServer: {
        command: "pnpm exec react-router-serve ./build/server/index.js",
        url: `http://localhost:${PORT}`,
        env: {PORT: String(PORT)},
        reuseExistingServer: false,
        timeout: 60_000,
    },
});
