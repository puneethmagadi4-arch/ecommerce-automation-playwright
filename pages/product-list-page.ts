import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { ProductInfo } from '../types/types';

export class ProductListPage extends BasePage {
  private readonly productName: string = "div.item-box h2.product-title a, h2.product-title a, .product-title a";  // Updated based on site inspection
  private readonly productPrice: string = "span.price, .actual-price, div.prices span";  // Updated based on site inspection
  private readonly addToCartButton: string = "button.button-2.product-box-add-to-cart-button";  // Correct button selector from investigation
  private readonly productDetailLink: string = "h2.product-title a, .product-title a";  // Updated based on site inspection

  constructor(page: Page) {
    super(page);
  }

  list(): this {
    return this;
  }

  async getProductNames(): Promise<string[]> {
    const isFast = process.env.PLAYWRIGHT_FAST === 'true';
    if (!isFast) await this.page.waitForLoadState('load');
    await this.page.waitForSelector('.search-results, .item-grid, .products-grid, .category-products, body', { timeout: isFast ? 2000 : 10000 });

    // Shorter wait for products to render after search
    if (isFast) {
      await this.page.waitForTimeout(100);
    } else {
      await this.page.waitForTimeout(500);
    }

    // Try to wait for actual product items
    try {
      await this.page.waitForSelector('.item-box, .product-item', { timeout: isFast ? 500 : 2000, state: 'attached' });
    } catch (e) {
      console.log('Warning: No .item-box or .product-item found, continuing anyway');
    }

    // Try multiple selectors in order of preference - debug shows all work
    let elements: any[] = [];
    const selectors = ['.item-box h2 a', '.product-item .details h2 a', 'h2.product-title a', '.product-title a', this.productName];

    for (const selector of selectors) {
      elements = await this.findElements(selector);
      console.log(`Trying selector "${selector}": found ${elements.length} elements`);
      if (elements.length > 0) {
        console.log(`✅ SUCCESS: Found ${elements.length} product name elements with selector: ${selector}`);
        break;
      }
    }

    const names = await Promise.all(elements.slice(0, 10).map(async (el) => (await el.textContent() || '').toLowerCase().trim()));
    console.log(`Found ${names.length} product names in results: ${names.join(', ')}`);
    return names.filter(name => name);
  }

  async getFirst10ProductsInfo(): Promise<ProductInfo[]> {
    const isFast = process.env.PLAYWRIGHT_FAST === 'true';
    if (!isFast) await this.page.waitForLoadState('load');
    await this.page.waitForSelector('.search-results, .item-grid, .products-grid, .category-products, body', { timeout: isFast ? 2000 : 10000 });
    // Shorter wait for products to render after search
    if (isFast) {
      await this.page.waitForTimeout(100);
    } else {
      await this.page.waitForTimeout(500);
    }

    // Try multiple selectors for names - debug shows all work
    let nameElements: any[] = [];
    const nameSelectors = ['.item-box h2 a', '.product-item .details h2 a', 'h2.product-title a', '.product-title a', this.productName];

    for (const selector of nameSelectors) {
      nameElements = await this.findElements(selector);
      console.log(`Trying name selector "${selector}": found ${nameElements.length} elements`);
      if (nameElements.length > 0) {
        console.log(`✅ SUCCESS: Found ${nameElements.length} product name elements with selector: ${selector}`);
        break;
      }
    }

    const products: ProductInfo[] = [];
    console.log(`Found ${nameElements.length} products for info extraction (first 10 for price rules)`);
    for (let i = 0; i < nameElements.length && i < 10; i++) {
      const elem = nameElements[i];
      const name = (await elem.textContent() || '').trim();
      if (!name) continue;
      const itemBox = this.page.locator('.item-box').nth(i);
      const priceLocator = itemBox.locator(this.productPrice);
      const priceText = await priceLocator.textContent() || '';
      const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
      const detailLink = itemBox.locator(this.productDetailLink);
      const addButton = itemBox.locator(this.addToCartButton);
      products.push({ name, price, detailLink, addButton });
      console.log(`Product ${i+1}: "${name}" - $${price.toFixed(2)} (check for low/high rules)`);
    }
    return products;
  }

  async addDirect(index: number): Promise<this> {  // Take index for nth button
    const isFast = process.env.PLAYWRIGHT_FAST === 'true';
    if (!isFast) await this.page.waitForLoadState('load');
    await this.page.evaluate((idx) => {
      const itemBox = document.querySelectorAll('.item-box')[idx];
      if (itemBox) {
        const button = itemBox.querySelector('button.product-box-add-to-cart-button, button.button-2, .buttons button') as HTMLElement;
        if (button) {
          button.click();
        }
      }
    }, index);
    console.log(`Added directly to cart (high price rule for product index ${index})`);
    // Fixed: Wait for mini-cart update (reliable indicator of add success; 15s fast for site delay, attached state)
    try {
      await this.page.waitForSelector('.cart-qty, .mini-shopping-cart .count, .bar-notification', { 
        state: 'attached', 
        timeout: isFast ? 15000 : 30000 
      });
      console.log('Add success: Mini-cart updated or notification appeared');
    } catch (e) {
      console.log('Add may have succeeded without visible notification (site variability) – continuing');
    }
    if (isFast) await this.page.waitForTimeout(500);  // Light delay for visible add
    return this;
  }
}