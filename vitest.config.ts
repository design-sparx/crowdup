import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {"@": fileURLToPath(new URL("./src", import.meta.url))},
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    // Every file gets its own worker. At the default (all cores) a loaded Windows machine can miss
    // vitest's fixed 60s worker-start deadline and report "Failed to start forks worker".
    maxWorkers: process.env.CI ? undefined : 4,
  },
});
