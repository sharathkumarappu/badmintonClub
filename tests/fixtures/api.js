import { test as base, expect } from '@playwright/test';

/**
 * Fixture for API testing with common setup
 */
const test = base.extend({
  apiContext: async ({ playwright, baseURL }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: baseURL || 'http://localhost:3000',
    });

    await use(apiContext);
    
    // Cleanup
    await apiContext.dispose();
  },
});

export { test, expect };
