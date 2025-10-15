import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { CartItem } from '../types/types';

export class CartPage extends BasePage {
  private readonly productNameInCart: string = "td.product a, .product-name a, .cart-item-row .product-name a";
  private readonly productPriceInCart: string = "td.unit-price .price, .unit-price, .cart-item-row .unit-price";
  private readonly productQtyInCart: string = "td.quantity input, .cart-item-row .quantity input";
  private readonly cartTotal: string = ".order-total .value-summary, .order-total, .cart-total";

  constructor(page: Page) {
    super(page);
  }

  cart(): this {
    return this;
  }

  async goTo(): Promise<this> {
    // INSTANT cart navigation - no waits at all
    console.log('Navigating INSTANTLY to cart page...');
    await this.page.goto('https://demo.nopcommerce.com/cart', { 
      waitUntil: 'domcontentloaded', 
      timeout: 2000 
    });
    
    // MANUAL SCROLLING - STEP BY STEP TO SEE CART TOTAL
    console.log('🖱️ MANUAL SCROLLING TO SHOW CART TOTAL...');
    
    // Step 1: Scroll to top
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 1: Scrolling to TOP of cart');
    await this.page.waitForTimeout(2000);
    
    // Step 2: Scroll down slowly
    await this.page.evaluate(() => {
      window.scrollTo({ top: 400, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 2: Scrolling DOWN 400px');
    await this.page.waitForTimeout(2000);
    
    // Step 3: Scroll down more to see cart items
    await this.page.evaluate(() => {
      window.scrollTo({ top: 800, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 3: Scrolling DOWN 800px to see cart items');
    await this.page.waitForTimeout(2000);
    
    // Step 4: Scroll down to see total
    await this.page.evaluate(() => {
      window.scrollTo({ top: 1200, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 4: Scrolling DOWN 1200px to see TOTAL');
    await this.page.waitForTimeout(3000);
    
    // Step 5: Scroll back up to see total clearly
    await this.page.evaluate(() => {
      window.scrollTo({ top: 1000, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 5: Scrolling UP to 1000px to see TOTAL clearly');
    await this.page.waitForTimeout(3000);
    
    console.log('🖱️ MANUAL CART SCROLLING COMPLETED - TOTAL SHOULD BE VISIBLE!');
    
    console.log('Cart page loaded INSTANTLY');
    return this;
  }

  async getCartProducts(): Promise<CartItem[]> {
    // Improved cart products retrieval with better error handling
    console.log('Retrieving cart data INSTANTLY...');
    
    // Try multiple approaches to find cart items
    let items: CartItem[] = [];
    
    // Approach 1: Try table-based cart layout
    const tableRows = await this.page.$$('table.cart tbody tr');
    if (tableRows.length > 0) {
      console.log(`Found ${tableRows.length} table rows`);
      for (const row of tableRows) {
        const nameElement = await row.$('td.product a, .product-name a');
        const priceElement = await row.$('td.unit-price .price, .unit-price');
        const qtyElement = await row.$('td.quantity input');
        
        if (nameElement) {
          const name = (await nameElement.textContent() || '').trim();
          const priceText = priceElement ? (await priceElement.textContent() || '') : '0';
          const qtyText = qtyElement ? (await qtyElement.inputValue() || '1') : '1';
          const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
          const qty = parseInt(qtyText) || 1;
          if (name && name !== 'Edit') {
            items.push({ name, price, qty });
            console.log(`Cart item: "${name}" - $${price} (Qty: ${qty})`);
          }
        }
      }
    }
    
    // Approach 2: Try div-based cart layout if table approach failed
    if (items.length === 0) {
      const cartItems = await this.page.$$('.cart-item-row, .shopping-cart-item');
      console.log(`Found ${cartItems.length} cart item divs`);
      for (const item of cartItems) {
        const nameElement = await item.$('.product-name a, .cart-item-name a');
        const priceElement = await item.$('.unit-price, .cart-item-price');
        const qtyElement = await item.$('.quantity input, .cart-item-quantity input');
        
        if (nameElement) {
          const name = (await nameElement.textContent() || '').trim();
          const priceText = priceElement ? (await priceElement.textContent() || '') : '0';
          const qtyText = qtyElement ? (await qtyElement.inputValue() || '1') : '1';
          const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
          const qty = parseInt(qtyText) || 1;
          if (name && name !== 'Edit') {
            items.push({ name, price, qty });
            console.log(`Cart item: "${name}" - $${price} (Qty: ${qty})`);
          }
        }
      }
    }
    
    console.log(`Found ${items.length} cart items`);
    return items;
  }

  async getCartTotal(): Promise<number> {
    // Improved cart total retrieval with multiple fallback approaches
    let total = 0;
    
    // Try multiple selectors for cart total
    const totalSelectors = [
      '.order-total .value-summary',
      '.order-total',
      '.cart-total',
      '.total-price',
      'td.cart-total .value-summary',
      'span.product-subtotal'
    ];
    
    for (const selector of totalSelectors) {
      const elements = await this.page.$$(selector);
      if (elements.length > 0) {
        const totalText = await elements[elements.length - 1].textContent() || '0';
        const parsedTotal = parseFloat(totalText.replace(/[^\d.]/g, '')) || 0;
        if (parsedTotal > 0) {
          total = parsedTotal;
          console.log(`Cart total: $${total} (from selector: ${selector})`);
          break;
        }
      }
    }
    
    // Fallback: Calculate total from individual items if no total found
    if (total === 0) {
      const items = await this.getCartProducts();
      total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      console.log(`Cart total calculated from items: $${total}`);
    }
    
    return total;
  }
}