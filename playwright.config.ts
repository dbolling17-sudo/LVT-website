import { defineConfig, devices } from "@playwright/test";

// End-to-end checks against a production build. Heartland's page is stubbed in the tests,
// so they prove our links point at it, not that an order goes through.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3100" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    env: { LVT_FIXTURES: "1" },
  },
});
