import { test, expect } from './fixtures/api';

test.describe('API Request-Response Tests', () => {

  test('should make GET request to home page', async ({ apiContext }) => {
    const response = await apiContext.get('/');
    expect(response.status()).toBe(200);

    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should make GET request to search endpoint', async ({ apiContext }) => {
    const response = await apiContext.get('/search?cat=player&memberSearch=');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should make GET request to member-registration page', async ({ apiContext }) => {
    const response = await apiContext.get('/member-registration');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should return 404 for invalid member ID', async ({ apiContext }) => {
    const response = await apiContext.get('/member/999999');
    expect(response.status()).toBe(404);
  });

  test('should handle query parameters correctly', async ({ apiContext }) => {
    const response = await apiContext.get('/search?cat=team&memberSearch=');
    expect(response.status()).toBe(200);
  });

  test('should return proper headers for HTML requests', async ({ apiContext }) => {
    const response = await apiContext.get('/');
    const headers = response.headers();

    expect(headers['content-type']).toContain('text/html');
    expect(headers['x-frame-options']).toBeTruthy();
  });

});

test.describe('Form Submission Tests', () => {

  test('should submit member registration form via POST', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
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

    expect(response.status()).toBe(200);
    expect(response.url()).toBe('http://localhost:3000/');
  });

  test('should handle form submission with minimal fields', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
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

    expect(response.status()).toBe(200);
    expect(response.url()).toBe('http://localhost:3000/');
  });

  test('should return 400 Bad Request with invalid gender', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'male',
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid team', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'Team A',
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid level', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'intermediate',
        type: 'feather shuttle',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid type', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'Intermediate',
        type: 'regular',
        dow: 'Tuesday',
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 400 Bad Request with invalid days of week', async ({ apiContext }) => {
    const response = await apiContext.post('/member-registration', {
      form: {
        name: 'Invalid User',
        age: '30',
        gender: 'Male',
        team: 'RED',
        level: 'Intermediate',
        type: 'feather shuttle',
        dow: ['Monday', 'Wednesday'],
        registration_date: '2025-12-09',
      },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('Performance Tests', () => {

  test('home page should load within acceptable time', async ({ apiContext }) => {
    const startTime = Date.now();
    const response = await apiContext.get('/');
    const endTime = Date.now();

    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(3000);
  });

  test('search endpoint should respond quickly', async ({ apiContext }) => {
    const startTime = Date.now();
    const response = await apiContext.get('/search?cat=player&memberSearch=');
    const endTime = Date.now();

    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(3000);
  });

});
