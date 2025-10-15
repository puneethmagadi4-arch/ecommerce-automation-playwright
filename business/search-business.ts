import { Page, expect } from '@playwright/test';
import { SearchPage } from '../pages/search-page';
import { ProductListPage } from '../pages/product-list-page';
import { FixturesType, ProductInfo } from '../types/types';

export default class SearchBusiness {
  private searchPage: SearchPage;
  private productListPage: ProductListPage;
  private page: Page;
  private fixtures: FixturesType;

  constructor(page: Page, fixtures: FixturesType) {
    this.page = page;
    this.searchPage = new SearchPage(page);
    this.productListPage = new ProductListPage(page);
    this.fixtures = fixtures;
  }

  async performSearch(productName: string): Promise<void> {
    console.log(`Performing search for: ${productName}`);
    
    try {
      // Check if we're already on a search page, if so, just update the search
      let currentUrl: string;
      let currentTitle: string;
      
      try {
        currentUrl = this.page.url();
        currentTitle = await this.page.title();
      } catch (error) {
        console.log('  → Page context lost, navigating to homepage...');
        await this.page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await this.page.waitForTimeout(1000);
        currentUrl = this.page.url();
        currentTitle = await this.page.title();
      }
      
      if (currentUrl.includes('/search') && currentTitle.includes('Search')) {
        console.log('Already on search page, updating search...');
        // We're already on search results page, just update the search
        await this.page.fill('#small-searchterms', '');
        await this.page.fill('#small-searchterms', productName);
        console.log(`Updated search box with: ${productName}`);
        
        // Click the search button
        await this.page.click('button.button-1.search-box-button');
        console.log('Clicked search button');
        
        // Wait for new search results to load
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(50); // Ultra fast wait for search results
        
        // MANUAL SCROLLING TO SHOW SEARCH RESULTS AND RATES
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
        
      } else if (currentUrl.includes('demo.nopcommerce.com')) {
        // We're on the demo site but not on search page, just search directly
        console.log('On demo site, searching directly...');
        await this.page.fill('#small-searchterms', '');
        await this.page.fill('#small-searchterms', productName);
        console.log(`Filled search box with: ${productName}`);
        
        // Click the search button
        await this.page.click('button.button-1.search-box-button');
        console.log('Clicked search button');
        
        // Wait for search results page to load
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(50); // Ultra fast wait for search results
        
        // MANUAL SCROLLING TO SHOW SEARCH RESULTS AND RATES
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
        
      } else {
        // First search or not on search page, navigate to homepage first
        console.log('Navigating to homepage for first search...');
        await this.page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Wait for the search box to be visible
        await this.page.waitForSelector('#small-searchterms', { timeout: 10000 });
        
        // Clear and fill the search box
        await this.page.fill('#small-searchterms', '');
        await this.page.fill('#small-searchterms', productName);
        console.log(`Filled search box with: ${productName}`);
        
        // Click the search button
        await this.page.click('button.button-1.search-box-button');
        console.log('Clicked search button');
        
        // Wait for search results page to load
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(50); // Ultra fast wait for search results
        
        // MANUAL SCROLLING TO SHOW SEARCH RESULTS AND RATES
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
      }
      
      // Check if we're on the search results page
      const pageTitle = await this.page.title();
      console.log(`Search page title: ${pageTitle}`);
      
      // Check if we have search results
      const hasResults = await this.page.locator('.search-results, .item-grid, .products-grid').count() > 0;
      console.log(`Search results found: ${hasResults}`);
      
      if (pageTitle.includes('Search') && hasResults) {
        console.log(`Successfully performed search for: ${productName}`);
      } else {
        console.log(`Warning: Search may not have completed properly for: ${productName}`);
      }
      
    } catch (error) {
      console.log(`Error during search for ${productName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async validateKeywordInResults(keyword: string): Promise<void> {
    const names = await this.productListPage.list().getProductNames();
    expect(names.length, `Business rule failed: No products found for '${keyword}' (expected at least 1 with keyword)`).toBeGreaterThan(0);  // Strict: Expect >0 (working keywords)
    const found = names.some(name => name.includes(keyword.toLowerCase()));
    expect(found, `Business rule failed: Keyword '${keyword}' not found in results (expected in titles, e.g., 'Desktop Computer' for 'computer')`).toBeTruthy();  // Strict: Expect keyword appear
    console.log(`Business validation passed: Keyword '${keyword}' found in ${names.length} products`);
  }

  async processFirst10Products(): Promise<void> {
    const products = await this.productListPage.list().getFirst10ProductsInfo();
    console.log(`Processed ${products.length} products for cart business (prices scraped for rules)`);
  }
}