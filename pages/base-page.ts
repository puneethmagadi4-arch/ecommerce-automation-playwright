import { Page, Locator, ElementHandle } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async findElements(selector: string): Promise<ElementHandle[]> {
    const elements = await this.page.$$(selector);  // Get all matching elements
    if (elements.length === 0) {
      console.log(`No elements found for selector: ${selector} – returning empty array (normal for empty results/cart)`);  // Fixed: Log instead of throw (graceful for empty)
      return [];  // Fixed: Return [] (no throw; allows validation to handle empty)
    }
    return elements;
  }

  // Other methods (if any) – add if needed, but this is the key fix
}