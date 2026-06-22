import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

export default defineConfig({
  timeout: 200000,
  testDir: "./devices/tests/",
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  use: {
    headless: false,
    screenshot: "on",
    video: "on",
    storageState: fs.existsSync("auth.json") ? "auth.json" : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
