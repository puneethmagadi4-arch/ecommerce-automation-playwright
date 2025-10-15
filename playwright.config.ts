import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',  // Keeps your setting (Cucumber runs from root)
  use: {
    baseURL: 'https://demo.nopcommerce.com/',  // Keeps your baseURL (good for goto)
    headless: process.env.PLAYWRIGHT_HEADLESS === 'false' ? false : true,  // Dynamic – false for headed
    trace: 'on-first-retry',  // Keeps your trace
    screenshot: 'only-on-failure',  // Keeps your screenshot
    video: {
      mode: 'on',  // Always record videos for all tests
      size: { width: 1280, height: 720 }  // Video resolution
    },
    viewport: { width: 1280, height: 720 },  // Standard size for video
    // Cloudflare bypass settings
    bypassCSP: true,  // Bypass Content Security Policy
    ignoreHTTPSErrors: true,  // Ignore HTTPS certificate issues
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',  // Realistic user agent
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },  // Keeps your project
  ],
});


