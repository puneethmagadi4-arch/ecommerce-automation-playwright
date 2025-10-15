import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the homepage', async function (this: any) {
  await this.page.goto('https://demo.nopcommerce.com/', { waitUntil: 'domcontentloaded' });
});

When('I search for {string}', async function (this: any, product: string) {
  console.log(`Performing search for product: "${product}" (from Examples table with working keywords)`);
  await this.searchBusiness.performSearch(product);
});

Then('the search results should contain {string}', async function (this: any, keyword: string) {
  console.log(`Validating keyword "${keyword}" appears in results (from Examples table with working keywords)`);
  await this.searchBusiness.validateKeywordInResults(keyword);
});

Given('the cart has added products', async function (this: any) {
  console.log(`Adding products for each working keyword (full flow: search + first 10 prices/adds per rules)`);
  const workingKeywords = ['computer', 'laptop', 'apple'];  // Fixed: Same as Examples for per-product flow
  for (const product of workingKeywords) {
    console.log(`--- For product "${product}" ---`);
    await this.searchBusiness.performSearch(product);  // 1. Search
    await this.searchBusiness.processFirst10Products();  // 2. Retrieve first 10 prices
    await this.cartBusiness.addProductsByPriceRules();  // 3. Add per rules (low/high)
  }
});

When('I navigate to the cart page', async function (this: any) {
  await this.cartBusiness.navigateToCart();
});

Then('each product\'s name and price in cart should match the search results', async function (this: any) {
  await this.cartBusiness.verifyProductsAndPrices();  // 1. Confirm listed, 2. Prices match search
});

Then('the cart total should equal the sum of individual product prices considering quantities', async function (this: any) {
  await this.cartBusiness.validateTotalViaUI();  // 3. Total = sum (price * qty)
});

// New assessment workflow steps
When('I execute the assessment workflow for all required products', async function (this: any) {
  const AssessmentBusiness = (await import('../business/assessment-business')).default;
  const assessmentBusiness = new AssessmentBusiness(this.page, this.fixtures);
  await assessmentBusiness.executeAssessmentWorkflow();
});

Then('I should validate that all cart contents match the business rules', async function (this: any) {
  const AssessmentBusiness = (await import('../business/assessment-business')).default;
  const assessmentBusiness = new AssessmentBusiness(this.page, this.fixtures);
  await assessmentBusiness.validateCartContents();
});

Then('I should verify the cart total calculation is correct', async function (this: any) {
  // This is handled in the validateCartContents method
  console.log('Cart total validation completed in previous step');
});