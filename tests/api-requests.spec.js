const { test, expect } = require('@playwright/test');

test.describe('API Request-Response Tests', () => {
  let context;

  test.beforeAll(async ({ playwright }) => {
    // Create a context for API requests
    context = await playwright.request.newContext({
      baseURL: 'http://localhost:3000',
    });
  });

  test.afterAll(async () => {
    await context?.dispose();
  });

  test('should make GET request to home page', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    
    // Check content type is HTML
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should make GET request to search endpoint', async ({ request }) => {
    const response = await request.get('/search?cat=player&memberSearch=');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should make GET request to member-registration page', async ({ request }) => {
    const response = await request.get('/member-registration');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should return 404 for invalid member ID', async ({ request }) => {
    const response = await request.get('/member/999999');
    expect(response.status()).toBe(404);
  });

  test('should handle query parameters correctly', async ({ request }) => {
    const response = await request.get('/search?cat=team&memberSearch=');
    expect(response.status()).toBe(200);
  });

  test('should return proper headers for HTML requests', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    
    expect(headers['content-type']).toContain('text/html');
    expect(headers['x-frame-options']).toBeTruthy(); // Helmet security header
  });
});

test.describe('Form Submission Tests', () => {
  test('should submit member registration form via POST', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'John Doe',
        age: '28',
        gender: 'Male',
        team: 'RED',
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: ['Tuesday', 'Friday'],
        registration_date: '2025-12-09',
        memberHistory: 'Played since 2020\nMultiple tournament wins',
      },
    });

    // Should redirect (302) on successful submission
    // Note: Playwright follows redirects, so we check the redirected URL
    expect(response.status()).toBe(200);
    expect(response.url()).toBe('http://localhost:3000/');
  });

  test('should handle form submission with minimal fields', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Jane Smith',
        age: '25',
        gender: 'Female',
        team: 'BLUE',
        level: 'Beginner',
        type: 'nylon shuttle',
        dow: 'Friday',
        registration_date: '2025-12-09',
      },
    });

    // Should redirect (302) on successful submission
    // Note: Playwright follows redirects, so we check the redirected URL
    expect(response.status()).toBe(200);
    expect(response.url()).toBe('http://localhost:3000/');
  });

  test('should return 400 Bad Request with invalid gender', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'male', // Invalid - should be 'Male'
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid team', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'Team A', // Invalid - should be RED, BLUE, or GREEN
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid level', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'intermediate', // Invalid - should be 'Intermediate'
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid type', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'Intermediate',
        type: 'regular', // Invalid - should be 'feather shuttle' or 'nylon shuttle'
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid days of week', async ({ request }) => {
    const response = await request.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: ['Monday', 'Wednesday'], // Invalid - should be 'Tuesday' or 'Friday'
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('Performance Tests', () => {
  test('home page should load within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/');
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('search endpoint should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/search?cat=player&memberSearch=');
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(3000);
  });
});
