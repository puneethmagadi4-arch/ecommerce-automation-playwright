import { Page, expect, Locator } from '@playwright/test';
import { CartPage } from '../pages/cart-page';
import { ProductListPage } from '../pages/product-list-page';
import { ProductDetailPage } from '../pages/product-detail-page';
import { FixturesType, ProductInfo, CartItem } from '../types/types';

export default class CartBusiness {
  private cartPage: CartPage;
  private productListPage: ProductListPage;
  private productDetailPage: ProductDetailPage;
  private page: Page;
  private fixtures: FixturesType;
  private addedProducts: (ProductInfo & { qty: number })[] = [];

  constructor(page: Page, fixtures: FixturesType) {
    this.page = page;
    this.cartPage = new CartPage(page);
    this.productListPage = new ProductListPage(page);
    this.productDetailPage = new ProductDetailPage(page);
    this.fixtures = fixtures;
  }

  async addProductsByPriceRules(): Promise<void> {
    const productsInfo = await this.productListPage.list().getFirst10ProductsInfo();
    let localAdded = [];
    for (let i = 0; i < productsInfo.length; i++) {
      const pInfo = productsInfo[i];
      const price = pInfo.price;
      let qty = 0;
      if (price < this.fixtures.thresholds.low_price) {
        console.log(`Low price $${price} – adding qty ${this.fixtures.thresholds.low_price_qty} from detail`);
        await pInfo.detailLink!.click();
        await this.productDetailPage.detail().setQuantity(this.fixtures.thresholds.low_price_qty);
        await this.productDetailPage.addToCart(pInfo.name);
        await this.page.waitForTimeout(3000);
        // Don't go back - stay on search results to preserve cart state
        // await this.page.goBack();
        qty = this.fixtures.thresholds.low_price_qty;
      } else if (price >= this.fixtures.thresholds.low_price && price <= this.fixtures.thresholds.high_price) {
        console.log(`High price $${price} – adding qty ${this.fixtures.thresholds.default_qty} direct`);
        try {
          const addButtonLocator = this.page.locator('.item-box').nth(i).locator('button.button-2.product-box-add-to-cart-button');
          await addButtonLocator.scrollIntoViewIfNeeded();
          if (await addButtonLocator.isVisible() && await addButtonLocator.isEnabled()) {
            const responsePromise = this.page.waitForResponse(resp => resp.url().includes('/addproducttocart') && resp.status() === 200, { timeout: 30000 });
            await addButtonLocator.click({ force: true });
            await responsePromise;
            console.log('Added directly – server response OK');
            await this.page.waitForTimeout(2000);
            qty = this.fixtures.thresholds.default_qty;
          } else {
            console.log('Direct add failed – falling back to detail');
            await pInfo.detailLink!.click();
            await this.productDetailPage.detail().setQuantity(this.fixtures.thresholds.default_qty);
            await this.productDetailPage.addToCart(pInfo.name);
            await this.page.waitForTimeout(3000);
            // Don't go back - stay on search results to preserve cart state
            // await this.page.goBack();
            qty = this.fixtures.thresholds.default_qty;
          }
        } catch (error) {
          console.log('Error in add – falling back');
          await pInfo.detailLink!.click();
          await this.productDetailPage.detail().setQuantity(this.fixtures.thresholds.default_qty);
          await this.productDetailPage.addToCart(pInfo.name);
          await this.page.waitForTimeout(3000);
          // Don't go back - stay on search results to preserve cart state
          // await this.page.goBack();
          qty = this.fixtures.thresholds.default_qty;
        }
      } else {
        console.log(`Price $${price} outside thresholds – skipping`);
      }
      if (qty > 0) {
        localAdded.push({ ...pInfo, qty });
      }
    }
    this.addedProducts = this.addedProducts.concat(localAdded);
    console.log(`Added products: ${localAdded.length}`);
  }

  async verifyAddedProductsInCart(): Promise<void> {
    const cartItems = await this.cartPage.cart().getCartProducts();
    if (this.addedProducts.length === 0) return;
    expect(cartItems.length).toBe(this.addedProducts.length);
    for (const added of this.addedProducts) {
      const found = cartItems.find(item => item.name.toLowerCase().includes(added.name.toLowerCase()) && item.qty === added.qty);
      expect(found).toBeDefined();
    }
    console.log('Verification passed');
  }

  async navigateToCart(): Promise<void> {
    await this.cartPage.cart().goTo();
  }

  async verifyProductsAndPrices(): Promise<void> {
    const cartItems = await this.cartPage.cart().getCartProducts();
    if (this.addedProducts.length === 0) return;
    expect(cartItems.length > 0).toBeTruthy();
    for (const added of this.addedProducts) {
      const match = cartItems.find(item => item.name.toLowerCase().includes(added.name.toLowerCase()));
      if (match) expect(Math.abs(match.price - added.price) < 0.01).toBeTruthy();
    }
    console.log('Prices verified');
  }

  async validateTotalViaUI(): Promise<void> {
    const expectedTotal = this.addedProducts.reduce((sum, p) => sum + p.price * p.qty, 0);
    const actualTotal = await this.cartPage.cart().getCartTotal();
    if (this.addedProducts.length === 0) expect(actualTotal).toBeCloseTo(0, 2);
    else expect(Math.abs(actualTotal - expectedTotal) < 0.01).toBeTruthy();
  }

  async validateTotalViaAPI(apiTotal: number): Promise<void> {
    const uiTotal = await this.cartPage.cart().getCartTotal();
    expect(Math.abs(uiTotal - apiTotal) < 0.01).toBeTruthy();
  }
}