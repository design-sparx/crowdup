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
  },
});
