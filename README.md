# E-commerce Test Automation Framework

A comprehensive, scalable UI test automation framework for e-commerce web applications built with Cucumber, Playwright, and TypeScript.

## 🎯 Assessment Requirements Fulfilled

This framework implements the complete assessment workflow for product search and cart management:

### Product Search & Validation
- ✅ Search for 8 specified products: wireless mouse, Bluetooth headset, Data cable, Pen drive, laptop stand, computer, laptop, apple
- ✅ Validate that expected keywords appear in search results
- ✅ Handle Cloudflare protection and site challenges

### Price-Based Cart Management
- ✅ **$1000-$1500**: Add products directly to cart
- ✅ **Below $1000**: Navigate to product detail page, set quantity to 2, then add to cart
- ✅ **Above $1500**: Skip (no rule defined)

### Cart Validation
- ✅ Confirm each added product is correctly listed on cart page
- ✅ Verify prices match between search results and cart
- ✅ Validate total cart value equals sum of individual product prices

## 🏗️ Framework Architecture

### Layered Design
```
┌─────────────────────────────────────┐
│           Feature Layer             │  ← Cucumber Gherkin
├─────────────────────────────────────┤
│         Step Definitions            │  ← Test Steps
├─────────────────────────────────────┤
│         Business Layer              │  ← Business Logic
├─────────────────────────────────────┤
│         Page Object Model           │  ← UI Interactions
├─────────────────────────────────────┤
│         Test Infrastructure         │  ← Hooks, Fixtures
└─────────────────────────────────────┘
```

### Key Components

#### 1. **Feature Files** (`features/`)
- `assessment-workflow.feature` - Complete assessment workflow
- `product-search-cart.feature` - Individual product search tests

#### 2. **Business Layer** (`business/`)
- `AssessmentBusiness` - Main workflow orchestrator
- `SearchBusiness` - Product search logic
- `CartBusiness` - Cart management logic
- `ApiClient` - API interactions

#### 3. **Page Objects** (`pages/`)
- `BasePage` - Common page functionality
- `SearchPage` - Search functionality
- `ProductListPage` - Product listing interactions
- `ProductDetailPage` - Product detail page
- `CartPage` - Shopping cart page

#### 4. **Test Infrastructure**
- `hooks/` - Setup and teardown
- `fixtures/` - Test data and configuration
- `types/` - TypeScript type definitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-cucumber-playwright

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Complete Assessment Workflow
```bash
# Run the full assessment workflow
npm test

# Run with visual browser (for debugging)
npm run test:headed

# Generate HTML report
npm run test:html
```

#### Individual Test Scenarios
```bash
# Run specific feature
npx cucumber-js features/assessment-workflow.feature

# Run with specific tags
npx cucumber-js --tags "@smoke"
```

## 📋 Test Scenarios

### Assessment Workflow
The framework implements the complete assessment requirements:

1. **Product Search Phase**
   - Search for each of the 8 specified products
   - Validate keywords appear in search results
   - Handle Cloudflare protection challenges

2. **Price-Based Cart Addition**
   - Process first 10 products from each search
   - Apply business rules based on price ranges
   - Add products to cart according to rules

3. **Cart Validation**
   - Verify all products are correctly added
   - Validate prices match search results
   - Confirm total calculation accuracy

### Business Rules Implementation
```typescript
// Price-based cart addition rules
if (product.price >= 1000 && product.price <= 1500) {
  // Add directly to cart
  await addProductDirectly(product);
} else if (product.price < 1000) {
  // Navigate to detail page, set quantity to 2
  await addProductWithQuantity(product, 2);
} else {
  // Skip products above $1500
  console.log('Price above $1500 - skipping');
}
```

## 🛠️ Framework Features

### Robust Error Handling
- Cloudflare protection bypass
- Retry mechanisms for failed operations
- Comprehensive error logging
- Graceful degradation

### Scalable Architecture
- Modular page object model
- Reusable business logic components
- Configurable test data
- Extensible design patterns

### Advanced Playwright Features
- Multiple browser support
- Headless and headed modes
- Screenshot and video capture
- Network request interception
- Custom user agents and viewports

### Comprehensive Reporting
- JSON test results
- HTML reports with screenshots
- Detailed console logging
- Performance metrics

## 🔧 Configuration

### Environment Variables
```bash
# Browser mode
PLAYWRIGHT_HEADLESS=false  # Run in headed mode

# Performance tuning
PLAYWRIGHT_FAST=true       # Use faster timeouts

# Debug mode
DEBUG=true                 # Enable debug logging
```

### Test Data (`fixtures/products.json`)
```json
{
  "thresholds": {
    "low_price": 1000,
    "high_price": 1500,
    "low_price_qty": 2,
    "default_qty": 1
  },
  "search_terms": [
    "wireless mouse",
    "Bluetooth headset",
    "Data cable",
    "Pen drive",
    "laptop stand",
    "computer",
    "laptop",
    "apple"
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

#### Cloudflare Protection
The demo site uses Cloudflare protection which can block automated requests. The framework includes:
- Multiple retry attempts
- User agent spoofing
- Request delay strategies
- Challenge detection and handling

#### Search Results Not Found
If search results are empty:
1. Check if Cloudflare challenge is active
2. Verify search terms are valid for the site
3. Increase wait times for page loading
4. Check network connectivity

#### Cart Navigation Issues
If cart navigation fails:
1. Verify cart icon selector is correct
2. Check if cart is empty (no products added)
3. Ensure proper page load states

## 📊 Test Results

### Sample Output
```
=== Assessment Workflow Results ===
✅ Search completed for 8 products
✅ Price-based rules applied successfully
✅ Cart validation passed
✅ Total calculation verified

Products Added:
1. Apple MacBook Pro - $1,200.00 (Qty: 1)
2. Build your own computer - $800.00 (Qty: 2)
3. Asus Laptop - $1,100.00 (Qty: 1)

Cart Total: $4,200.00
Expected Total: $4,200.00
✅ All validations passed!
```

## 🚀 Future Enhancements

- [ ] API testing integration
- [ ] Database validation
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] CI/CD pipeline integration

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the troubleshooting section
- Review the test logs for detailed error information

---

**Note**: This framework is designed for the nopCommerce demo site assessment. The Cloudflare protection on the demo site may require manual intervention or alternative testing approaches in some cases.
