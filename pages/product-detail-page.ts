import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductDetailPage extends BasePage {
  private readonly attributeSelect: string = "select[name^='product_attribute_'], select[id^='product_attribute_']";
  private readonly quantityInput: string = "input[name^='addtocart_'].EnteredQuantity, input.qty-input, input[name='addtocart_entered_quantity']";
  private readonly addToCartButton: string = "button.button-1.add-to-cart-button, input.button-1[value='Add to cart'], [id^='add-to-cart-button-'], .add-to-cart-button";

  constructor(page: Page) {
    super(page);
  }

  detail(): this {
    return this;
  }

  async setQuantity(qty: number): Promise<this> {
  const isFast = process.env.PLAYWRIGHT_FAST === 'true';
  if (!isFast) await this.page.waitForLoadState('load');
  await this.page.waitForSelector(this.quantityInput, { timeout: isFast ? 2000 : 10000 });
  await this.page.fill(this.quantityInput, qty.toString());
  console.log(`Set quantity to ${qty}`);
  // Ultra fast wait after quantity update
  await this.page.waitForTimeout(10);
  return this;
  }

  async addToCart(productName: string = ''): Promise<this> {
  const isFast = process.env.PLAYWRIGHT_FAST === 'true';
  if (!isFast) await this.page.waitForLoadState('load');
  
  // MANUAL SCROLLING - STEP BY STEP TO SEE PRICE
  console.log('🖱️ MANUAL SCROLLING TO SHOW PRICE...');
  
  // Step 1: Scroll to top
  await this.page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
  console.log('🖱️ Step 1: Scrolling to TOP');
  await this.page.waitForTimeout(2000);
  
  // Step 2: Scroll down slowly
  await this.page.evaluate(() => {
    window.scrollTo({ top: 300, left: 0, behavior: 'smooth' });
  });
  console.log('🖱️ Step 2: Scrolling DOWN 300px');
  await this.page.waitForTimeout(2000);
  
  // Step 3: Scroll down more
  await this.page.evaluate(() => {
    window.scrollTo({ top: 600, left: 0, behavior: 'smooth' });
  });
  console.log('🖱️ Step 3: Scrolling DOWN 600px');
  await this.page.waitForTimeout(2000);
  
  // Step 4: Scroll back up to see price area
  await this.page.evaluate(() => {
    window.scrollTo({ top: 200, left: 0, behavior: 'smooth' });
  });
  console.log('🖱️ Step 4: Scrolling UP to 200px to see PRICE');
  await this.page.waitForTimeout(3000);
  
  console.log('🖱️ MANUAL SCROLLING COMPLETED - PRICE SHOULD BE VISIBLE!');
    const attributeSelects = await this.page.$$(this.attributeSelect);
    if (attributeSelects.length > 0) {
      console.log(`Found ${attributeSelects.length} attribute selects`);
      for (let j = 0; j < attributeSelects.length; j++) {
        const select = attributeSelects[j];
        if (productName.toLowerCase().includes('build your own computer')) {
          const nameAttr = await select.getAttribute('name') || '';
          if (nameAttr.includes('product_attribute_')) {
            const innerText = await select.innerText() || '';
            if (innerText.includes('2.2 GHz Intel Core i3')) {
              await select.selectOption({ label: '2.2 GHz Intel Core i3' });
              console.log('Selected 2GB RAM');
            } else if (innerText.includes('320 GB')) {
              await select.selectOption({ label: '320 GB' });
              console.log('Selected 320GB HDD');
            } else {
                const options = await select.$$('option');  // Query all options
                const validOptions = [];
                for (const option of options) {
                  const value = await option.getAttribute('value');
                  if (value !== '0') {
                    validOptions.push(option);
                  }
                }
              if (validOptions.length > 0) {
                const firstValue = await validOptions[0].getAttribute('value') || '';
                await select.selectOption(firstValue);
                console.log(`Selected first valid for attribute ${j + 1}`);
              }
            }
          }
        } else {
          const options = await select.$$('option');
          const validOptions = [];
          for (const option of options) {
            const value = await option.getAttribute('value');
            if (value !== '0') {
              validOptions.push(option);
            }
          }
          if (validOptions.length > 0) {
            const firstValue = await validOptions[0].getAttribute('value') || '';
            await select.selectOption(firstValue);
            console.log(`Selected first valid for attribute ${j + 1}`);
          }
        }
      }
      // Ultra fast wait
      await this.page.waitForTimeout(10);
    }
  await this.page.waitForSelector(this.addToCartButton, { timeout: isFast ? 2000 : 10000 });
  const responsePromise = this.page.waitForResponse(resp => resp.url().includes('/addproducttocart') && resp.status() === 200, { timeout: isFast ? 3000 : 10000 });
    await this.page.evaluate(() => {
      const button = document.querySelector("button.button-1.add-to-cart-button, input.button-1[value='Add to cart'], [id^='add-to-cart-button-'], .add-to-cart-button") as HTMLElement;
      if (button) button.click();
    });
    await responsePromise;
    console.log('Added to cart');
    try {
  await this.page.waitForSelector('.bar-notification, .success-message', { timeout: isFast ? 2000 : 5000 });
    } catch {
      console.log('Notification not found');
    }
    await this.page.waitForLoadState('networkidle');
    if (isFast) {
      await this.page.waitForTimeout(100);
    } else {
      await this.page.waitForTimeout(100);
    }
    return this;
  }

  async addBuildYourOwnComputer(): Promise<this> {
    const isFast = process.env.PLAYWRIGHT_FAST === 'true';
    console.log('Configuring Build your own computer...');
    
    // MANUAL SCROLLING - STEP BY STEP TO SEE PRICE AND CONFIGURATION
    console.log('🖱️ MANUAL SCROLLING TO SHOW PRICE AND CONFIGURATION...');
    
    // Step 1: Scroll to top
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 1: Scrolling to TOP');
    await this.page.waitForTimeout(2000);
    
    // Step 2: Scroll down slowly
    await this.page.evaluate(() => {
      window.scrollTo({ top: 300, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 2: Scrolling DOWN 300px');
    await this.page.waitForTimeout(2000);
    
    // Step 3: Scroll down more
    await this.page.evaluate(() => {
      window.scrollTo({ top: 600, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 3: Scrolling DOWN 600px');
    await this.page.waitForTimeout(2000);
    
    // Step 4: Scroll back up to see price area
    await this.page.evaluate(() => {
      window.scrollTo({ top: 200, left: 0, behavior: 'smooth' });
    });
    console.log('🖱️ Step 4: Scrolling UP to 200px to see PRICE');
    await this.page.waitForTimeout(3000);
    
    console.log('🖱️ MANUAL SCROLLING COMPLETED - PRICE AND CONFIGURATION SHOULD BE VISIBLE!');
    
    try {
      // Step 1: First Add to cart click
      await this.page.waitForSelector(this.addToCartButton, { timeout: isFast ? 2000 : 10000 });
      await this.page.click(this.addToCartButton);
      console.log('Step 1: Clicked Add to cart');
      await this.page.waitForTimeout(200);
      
      // Step 2: Select RAM - 2GB (dropdown)
      const ramSelector = 'select[name="product_attribute_2"]';
      await this.page.waitForSelector(ramSelector, { timeout: isFast ? 2000 : 10000 });
      await this.page.selectOption(ramSelector, { label: '2 GB' });
      console.log('Step 2: Selected RAM - 2GB');
      await this.page.waitForTimeout(100);
      
      // Step 3: Select HDD - 320GB (radio button)
      const hddSelector = 'input[name="product_attribute_3"][value="6"]';
      await this.page.waitForSelector(hddSelector, { timeout: isFast ? 2000 : 10000 });
      await this.page.check(hddSelector);
      console.log('Step 3: Selected HDD - 320GB');
      await this.page.waitForTimeout(100);
      
      // Step 4: Final Add to cart click
      await this.page.click(this.addToCartButton);
      console.log('Step 4: Final Add to cart click');
      
      // Wait for success response
      const responsePromise = this.page.waitForResponse(resp => resp.url().includes('/addproducttocart') && resp.status() === 200, { timeout: isFast ? 3000 : 10000 });
      await responsePromise;
      console.log('Build your own computer configured and added to cart');
      
      // Wait for notification
      try {
        await this.page.waitForSelector('.bar-notification, .success-message', { timeout: isFast ? 2000 : 5000 });
      } catch {
        console.log('Notification not found');
      }
      
      await this.page.waitForLoadState('networkidle');
      // Ultra fast wait
      await this.page.waitForTimeout(10);
      
    } catch (error) {
      console.log(`Error configuring Build your own computer: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return this;
  }
}