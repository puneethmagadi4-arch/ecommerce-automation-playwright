import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import { chromium, Browser, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { FixturesType } from '../types/types';

// Removed playwright-stealth due to compatibility issues

setDefaultTimeout(300 * 1000);  // 5 min global for Cucumber steps/hooks

class CustomWorld {
  page!: Page;
  fixtures!: FixturesType;
  searchBusiness!: any;
  cartBusiness!: any;
  apiClient!: any;

  constructor() {
    this.fixtures = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'fixtures/products.json'), 'utf8'));
  }
}

setWorldConstructor(CustomWorld);

let browser: any;

BeforeAll(async function (this: any) {
  const world = this as CustomWorld;
  const envHeadless = process.env.PLAYWRIGHT_HEADLESS;
  console.log(`PLAYWRIGHT_HEADLESS env var: ${envHeadless || 'undefined (default true)'}`);
  const headless = envHeadless === 'false' ? false : true;
  
  // Use simple browser launch with minimal arguments
  browser = await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--start-maximized',
      '--window-size=1920,1080'
    ]
  });
  console.log(`Browser launched in ${headless ? 'headless' : 'headed'} mode with persistent context`);
});

AfterAll(async function () {
  await browser.close();
});

Before(async function (this: any) {
  const world = this as CustomWorld;
  
  // Create a new context and page with video recording
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    recordVideo: {
      dir: 'test-results/videos/',
      size: { width: 1280, height: 720 }
    }
  });

  world.page = await context.newPage();
  
  // Maximize the browser window
  try {
    await world.page.evaluate(() => {
      if (window.screen) {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
      }
    });
    // Also try to maximize using Playwright's built-in method
    await world.page.setViewportSize({ width: 1920, height: 1080 });
    console.log('Browser window maximized to full screen (1920x1080)');
  } catch (error) {
    console.log('Could not maximize window:', error);
  }
  
  const isFast = process.env.PLAYWRIGHT_FAST === 'true';
  const timeout = isFast ? 5000 : 180000;  // 5s fast vs 3 min full
  world.page.setDefaultTimeout(timeout);

  const SearchBusiness = (await import('../business/search-business')).default;
  world.searchBusiness = new SearchBusiness(world.page, world.fixtures);
  const CartBusiness = (await import('../business/cart-business')).default;
  world.cartBusiness = new CartBusiness(world.page, world.fixtures);
  const ApiClient = (await import('../business/api-client')).default;
  world.apiClient = new ApiClient();

  // Navigate to the demo site only if not already there
  const currentUrl = world.page.url();
  if (!currentUrl.includes('demo.nopcommerce.com')) {
    console.log('Navigating to demo.nopcommerce.com...');
    await world.page.goto('https://demo.nopcommerce.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: isFast ? 10000 : 60000 
    });
    
    // Wait for page to fully load
    await world.page.waitForTimeout(2000);
    
    const pageTitle = await world.page.title();
    console.log(`Page title: ${pageTitle}`);
    console.log('Successfully navigated to demo site');
  } else {
    console.log('Already on demo site, continuing with current page...');
  }

        if (!isFast) {
          await world.page.waitForLoadState('load', { timeout: 60000 });
          await world.page.waitForTimeout(1000); // Much faster initial wait after URL opens
        } else {
          await world.page.waitForTimeout(100);  // Much faster for fast mode
        }
  console.log(`Using ${isFast ? 'fast' : 'full'} mode (timeouts: ${timeout/1000}s)`);
});

After(async function (this: any) {
  const world = this as CustomWorld;
  if (world.page) {
    // Save video before closing the page
    const context = world.page.context();
    if (context) {
      await context.close();
      console.log('Video saved to test-results/videos/');
    }
  }
});
