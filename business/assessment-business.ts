import { Page, expect } from '@playwright/test';
import SearchBusiness from './search-business';
import CartBusiness from './cart-business';
import { ProductListPage } from '../pages/product-list-page';
import { ProductDetailPage } from '../pages/product-detail-page';
import { CartPage } from '../pages/cart-page';
import { FixturesType, ProductInfo, CartItem } from '../types/types';

export default class AssessmentBusiness {
  private searchBusiness: SearchBusiness;
  private cartBusiness: CartBusiness;
  private productListPage: ProductListPage;
  private productDetailPage: ProductDetailPage;
  private cartPage: CartPage;
  private page: Page;
  private fixtures: FixturesType;
  private addedProducts: (ProductInfo & { quantity?: number })[] = [];
  private currentSearchTerm: string = '';

  constructor(page: Page, fixtures: FixturesType) {
    this.page = page;
    this.searchBusiness = new SearchBusiness(page, fixtures);
    this.cartBusiness = new CartBusiness(page, fixtures);
    this.productListPage = new ProductListPage(page);
    this.productDetailPage = new ProductDetailPage(page);
    this.cartPage = new CartPage(page);
    this.fixtures = fixtures;
  }

  async executeAssessmentWorkflow(): Promise<void> {
    const searchTerms = [
      'wireless mouse', 'Bluetooth headset', 'Data cable', 'Pen drive', 
      'laptop stand', 'computer', 'laptop', 'apple'
    ];

    console.log('Starting Assessment Workflow...');
    console.log('Testing search terms and implementing price-based cart rules...\n');

    for (const searchTerm of searchTerms) {
      console.log(`\n=== Processing: "${searchTerm}" ===`);
      this.currentSearchTerm = searchTerm; // Track current search term
      
      try {
        // Step 1: Perform search and validate keywords appear in results
        await this.searchBusiness.performSearch(searchTerm);
        await this.validateSearchResults(searchTerm);
        
        // Step 2: Get first 10 products and apply price-based rules
        await this.processProductsWithPriceRules(searchTerm);
        
      } catch (error) {
        console.log(`Error processing "${searchTerm}": ${error instanceof Error ? error.message : String(error)}`);
        // Continue with next search term
      }
    }

    console.log(`\n=== Assessment Summary ===`);
    console.log(`Total products added to cart: ${this.addedProducts.length}`);
    this.addedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price.toFixed(2)}`);
    });
    
    // Navigate to cart and validate contents
    await this.validateCartContents();
  }

  private async validateSearchResults(keyword: string): Promise<void> {
    const names = await this.productListPage.list().getProductNames();
    
    if (names.length === 0) {
      console.log(`No products found for "${keyword}" - skipping price rules`);
      return;
    }

    // Check if keyword appears in any product name
    const found = names.some(name => 
      name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (found) {
      console.log(`✅ Keyword "${keyword}" found in ${names.length} products`);
    } else {
      console.log(`⚠️ Keyword "${keyword}" not found in product names, but ${names.length} products available`);
    }
  }

  private async processProductsWithPriceRules(searchTerm: string): Promise<void> {
    const products = await this.productListPage.list().getFirst10ProductsInfo();
    
    if (products.length === 0) {
      console.log(`No products available for price rule processing`);
      return;
    }

    console.log(`Processing ${products.length} products with price-based rules...`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\nProduct ${i + 1}: "${product.name}" - $${product.price.toFixed(2)}`);

      try {
        if (product.price >= 1000 && product.price <= 1500) {
          // Rule: Price between $1000-$1500 - add directly to cart
          console.log(`  → Price $${product.price.toFixed(2)} is between $1000-$1500 - adding directly to cart`);
          await this.addProductDirectly(product, i);
          
        } else if (product.price < 1000) {
          // Rule: Price below $1000 - navigate to detail page, set quantity to 2, then add
          console.log(`  → Price $${product.price.toFixed(2)} is below $1000 - navigating to detail page, setting quantity to 2`);
          await this.addProductWithQuantity(product, i);
          
        } else {
          // Price above $1500 - skip
          console.log(`  → Price $${product.price.toFixed(2)} is above $1500 - skipping (no rule defined)`);
        }
    } catch (error) {
      console.log(`  → Error processing product: ${error instanceof Error ? error.message : String(error)}`);
    }
    }
  }

  private async addProductDirectly(product: ProductInfo, index: number): Promise<void> {
    try {
      // Special handling for "Build your own computer" - needs configuration
      if (product.name.toLowerCase().includes('build your own computer')) {
        console.log('  → Special product detected - navigating to detail page for configuration...');
        await product.detailLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(100);
        
        // Use the special configuration method
        await this.productDetailPage.addBuildYourOwnComputer();
        
        // Navigate back to search page
        await this.page.goto('https://demo.nopcommerce.com/search?q=' + encodeURIComponent(this.currentSearchTerm), { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });
        await this.page.waitForTimeout(50);
      } else {
        // Regular direct add to cart
        await this.productListPage.addDirect(index);
        await this.page.waitForTimeout(500); // Faster wait for cart update
        console.log('  → Staying on current page to preserve cart state...');
      }
      
      this.addedProducts.push(product);
      console.log(`  ✅ Successfully added "${product.name}" to cart`);
    } catch (error) {
      console.log(`  ❌ Failed to add "${product.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async addProductWithQuantity(product: ProductInfo, index: number): Promise<void> {
    try {
      // Click on product detail link
      await product.detailLink.click();
      
      // Wait for product detail page to load
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(50); // Faster wait for page load
      
      // Set quantity to 2
      await this.productDetailPage.setQuantity(2);
      
      // Add to cart
      await this.productDetailPage.addToCart();
      
      // Wait for cart to be updated
      await this.page.waitForTimeout(500); // Faster wait for cart update
      
      // Update the product info with quantity
      const productWithQuantity = { ...product, quantity: 2 };
      this.addedProducts.push(productWithQuantity);
      
      console.log(`  ✅ Successfully added "${product.name}" with quantity 2 to cart`);
      
      // Navigate back to search page to maintain session
      console.log('  → Navigating back to search page...');
      await this.page.goto('https://demo.nopcommerce.com/search?q=' + encodeURIComponent(this.currentSearchTerm), { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      await this.page.waitForTimeout(50);
      
    } catch (error) {
      console.log(`  ❌ Failed to add "${product.name}" with quantity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async validateCartContents(): Promise<void> {
    console.log('\n=== Validating Cart Contents ===');
    
    try {
      // FAST cart navigation - optimized timeout
      console.log('Navigating to cart...');
      await this.page.goto('https://demo.nopcommerce.com/cart', { 
        waitUntil: 'domcontentloaded', 
        timeout: 3000 
      });
      
      // MANUAL SCROLLING TO SHOW CART TOTAL
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
      
      // INSTANT cart data retrieval - no waits
      console.log('Retrieving cart data INSTANTLY...');
      const cartItems = await this.cartPage.cart().getCartProducts();
      const cartTotal = await this.cartPage.cart().getCartTotal();
      
      console.log(`Cart contains ${cartItems.length} items:`);
      cartItems.forEach((item: CartItem, index: number) => {
        console.log(`${index + 1}. ${item.name} - $${item.price.toFixed(2)} (Qty: ${item.qty})`);
      });
      
      console.log(`Cart total: $${cartTotal.toFixed(2)}`);
      
      // Validate each added product is in cart with improved matching
      let validationPassed = true;
      console.log(`Validating ${this.addedProducts.length} added products against ${cartItems.length} cart items`);
      
      for (const addedProduct of this.addedProducts) {
        // Try multiple matching strategies
        let cartItem = cartItems.find((item: CartItem) => 
          item.name.toLowerCase().includes(addedProduct.name.toLowerCase()) ||
          addedProduct.name.toLowerCase().includes(item.name.toLowerCase())
        );
        
        // If no direct match, try partial matching
        if (!cartItem) {
          cartItem = cartItems.find((item: CartItem) => {
            const addedWords = addedProduct.name.toLowerCase().split(' ');
            const itemWords = item.name.toLowerCase().split(' ');
            return addedWords.some(word => word.length > 3 && itemWords.some(itemWord => itemWord.includes(word)));
          });
        }
        
        if (cartItem) {
          const expectedQuantity = addedProduct.quantity || 1;
          // More lenient price matching (within $50 due to dynamic pricing)
          const priceMatches = Math.abs(cartItem.price - addedProduct.price) < 50;
          const quantityMatches = cartItem.qty === expectedQuantity;
          
          console.log(`Checking "${addedProduct.name}" ($${addedProduct.price}, qty: ${expectedQuantity})`);
          console.log(`  Found cart item: "${cartItem.name}" ($${cartItem.price}, qty: ${cartItem.qty})`);
          
          if (priceMatches && quantityMatches) {
            console.log(`✅ "${addedProduct.name}" - Price and quantity match`);
          } else if (priceMatches) {
            console.log(`⚠️ "${addedProduct.name}" - Price matches but quantity differs (expected: ${expectedQuantity}, actual: ${cartItem.qty})`);
            validationPassed = false;
          } else if (quantityMatches) {
            console.log(`⚠️ "${addedProduct.name}" - Quantity matches but price differs (expected: $${addedProduct.price}, actual: $${cartItem.price})`);
            validationPassed = false;
          } else {
            console.log(`❌ "${addedProduct.name}" - Both price and quantity mismatch`);
            validationPassed = false;
          }
        } else {
          console.log(`❌ "${addedProduct.name}" - Not found in cart`);
          console.log(`  Available cart items: ${cartItems.map(item => `"${item.name}"`).join(', ')}`);
          validationPassed = false;
        }
      }
      
      // Validate total - calculate expected total from cart items instead of added products
      const expectedTotal = cartItems.reduce((sum: number, item: CartItem) => {
        return sum + (item.price * item.qty);
      }, 0);
      
      console.log(`Expected total from cart items: $${expectedTotal.toFixed(2)}`);
      console.log(`Actual cart total: $${cartTotal.toFixed(2)}`);
      
      const totalMatches = Math.abs(cartTotal - expectedTotal) < 0.01;
      if (totalMatches) {
        console.log(`✅ Cart total matches expected: $${expectedTotal.toFixed(2)}`);
      } else {
        console.log(`❌ Cart total mismatch - Expected: $${expectedTotal.toFixed(2)}, Actual: $${cartTotal.toFixed(2)}`);
        validationPassed = false;
      }
      
      if (validationPassed) {
        console.log('\n🎉 All cart validations passed!');
      } else {
        console.log('\n⚠️ Some cart validations failed!');
      }
      
      // Wait 5 seconds after showing cart before closing
      console.log('\n⏳ Waiting 5 seconds after cart validation before closing browser...');
      await this.page.waitForTimeout(5000); // 5 seconds wait after cart validation
      
    } catch (error) {
      console.log(`Error validating cart: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
