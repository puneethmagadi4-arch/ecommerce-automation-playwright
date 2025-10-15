import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  search(): this {
    return this;
  }

  async fillQuery(query: string): Promise<this> {
  const isFast = process.env.PLAYWRIGHT_FAST === 'true';
  if (!isFast) await this.page.waitForLoadState('load');
  await this.page.fill('#small-searchterms', query);
  console.log(`Filled #small-searchterms with: ${query}`);
  if (isFast) await this.page.waitForTimeout(100);  // Shorter delay for visible fill
  return this;
  }

  async submit(): Promise<this> {
    const isFast = process.env.PLAYWRIGHT_FAST === 'true';
    if (!isFast) await this.page.waitForLoadState('load');
    await this.page.click('button.button-1.search-box-button');
    console.log('Clicked button.button-1.search-box-button');
    // Shorter wait for results
    await this.page.waitForSelector('.search-results, .item-grid, .products-grid, body', {
      state: 'attached',
      timeout: isFast ? 2000 : 10000
    });
    if (isFast) await this.page.waitForTimeout(100);  // Shorter delay for visible results
    if (!isFast) await this.page.waitForLoadState('networkidle');
    
    // MANUAL SCROLLING - STEP BY STEP TO SEE SEARCH RESULTS AND RATES
    console.log('🖱️ MANUAL SCROLLING TO SHOW SEARCH RESULTS AND RATES...');
    
    // Step 1: Scroll to top
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 1: Scrolling to TOP of search results');
    await this.page.waitForTimeout(2000);
    
    // Step 2: Scroll down slowly to see products
    await this.page.evaluate(() => {
      window.scrollTo({ top: 300, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 2: Scrolling DOWN 300px to see products');
    await this.page.waitForTimeout(2000);
    
    // Step 3: Scroll down more to see all products
    await this.page.evaluate(() => {
      window.scrollTo({ top: 600, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 3: Scrolling DOWN 600px to see all products');
    await this.page.waitForTimeout(2000);
    
    // Step 4: Scroll back up to see product rates clearly
    await this.page.evaluate(() => {
      window.scrollTo({ top: 200, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 4: Scrolling UP to 200px to see PRODUCT RATES');
    await this.page.waitForTimeout(3000);
    
    console.log('🖱️ MANUAL SEARCH SCROLLING COMPLETED - RATES SHOULD BE VISIBLE!');
    
    return this;
  }
}