const { test, expect } = require('@playwright/test');

test.describe('Home Page API Tests', () => {
  test('GET / should return 200 and render HTML', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/Badminton Club/i);
  });

  test('GET / should display members list', async ({ page }) => {
    await page.goto('/');
    // Check if members are displayed (adjust selectors based on your HTML)
    const memberElements = await page.locator('div#membersGrid>div').count();
    expect(memberElements).toBeGreaterThan(0);
  });

  test('GET / should contain navigation', async ({ page }) => {
    await page.goto('/');
    const navbar = await page.locator('nav').count();
    expect(navbar).toBeGreaterThan(0);
  });
});

test.describe('Member Details API Tests', () => {
  test('GET /member/:id should return member details for valid ID', async ({ page }) => {
    // First, get the home page to find a member ID
    await page.goto('/');
    
    // Click on a member (adjust selector based on your HTML structure)
    const firstMemberLink = page.locator('a[href*="/member/"]').first();
    const memberUrl = await firstMemberLink.getAttribute('href');
    
    if (memberUrl) {
      const response = await page.goto(memberUrl);
      expect(response.status()).toBe(200);
      
      // Verify member information is displayed
      const content = await page.content();
      expect(content).toContain('Member');
    }
  });

  test('GET /member/invalid should return 404', async ({ page }) => {
    const response = await page.goto('/member/99999');
    expect(response.status()).toBe(404);
  });
});

test.describe('Search Functionality API Tests', () => {
  test('GET /search with player category should filter by player name', async ({ page }) => {
    await page.goto('/search?cat=player&memberSearch=');
    const response = await page.goto('/search?cat=player&memberSearch=a');
    expect(response.status()).toBe(200);
  });

  test('GET /search with team category should filter by team name', async ({ page }) => {
    const response = await page.goto('/search?cat=team&memberSearch=');
    expect(response.status()).toBe(200);
  });

  test('GET /search with missing parameters should still render', async ({ page }) => {
    const response = await page.goto('/search');
    expect(response.status()).toBe(200);
  });
});

test.describe('Member Registration Form Tests', () => {
  test('GET /member-registration should return 200', async ({ page }) => {
    const response = await page.goto('/member-registration');
    expect(response.status()).toBe(200);
  });

  test('GET /member-registration should display form fields', async ({ page }) => {
    await page.goto('/member-registration');
    
    // Check for form elements
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="age"]')).toBeVisible();
    await expect(page.locator('select[name="gender"]')).toBeVisible();
    await expect(page.locator('select[name="team"]')).toBeVisible();
    await expect(page.locator('select[name="level"]')).toBeVisible();
  });

  test('POST /member-registration should accept form submission', async ({ page }) => {
    await page.goto('/member-registration');
    
    // Fill form fields
    await page.fill('input[name="name"]', 'Test Player');
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="gender"]', 'Male');
    await page.selectOption('select[name="team"]', 'BLUE');
    await page.selectOption('select[name="level"]', 'Beginner');
    await page.fill('input[name="registration_date"]', '2025-12-09');
    
    // Submit form
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]'),
    ]);
    
    // Should redirect or show success
    expect(response.status()).toBeLessThan(400);
  });
});

test.describe('Error Handling Tests', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response.status()).toBe(404);
  });

  test('should display error page for 404', async ({ page }) => {
    await page.goto('/nonexistent-page');
    const content = await page.content();
    expect(content).toContain('Not Found');
  });
});
