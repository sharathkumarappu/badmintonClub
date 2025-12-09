const { base } = require('@playwright/test');

/**
 * Fixture for API testing with common setup
 */
const test = base.extend({
  apiContext: async ({ playwright, baseURL }, use) => {
    // Create an API context for the test
    const apiContext = await playwright.request.newContext({
      baseURL: baseURL || 'http://localhost:3000',
    });

    await use(apiContext);
    
    // Cleanup
    await apiContext.dispose();
  },
});

module.exports = { test, expect: base.expect };
