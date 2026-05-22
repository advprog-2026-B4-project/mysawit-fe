import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    pool: "threads",
    singleThread: true,
    fileParallelism: false,
    isolate: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/app/**/layout.tsx",
        "src/**/index.ts",
        "src/test/**",
      ],
    },
  },
});
