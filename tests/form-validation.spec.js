import { test, expect } from '@playwright/test';

test.describe('Form Validation - Server-Side & Client-Side', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/member-registration');
  });

  test.describe('Client-side validation on blur/change events', () => {
    
    test('should show error when name field is blurred empty', async ({ page }) => {
      const nameField = page.locator('#nameField');
      const nameError = page.locator('#nameError');
      
      // Focus and blur without entering text
      await nameField.focus();
      await nameField.blur();
      
      // Error should be visible
      await expect(nameError).toHaveClass(/show/);
    });

    test('should show error when age field is blurred with invalid value', async ({ page }) => {
      const ageField = page.locator('#ageField');
      const ageError = page.locator('#ageError');
      
      // Enter invalid age (negative)
      await ageField.fill('-5');
      await ageField.blur();
      
      // Error should be visible
      await expect(ageError).toHaveClass(/show/);
    });

    test('should show error when gender is not selected', async ({ page }) => {
      const genderField = page.locator('#genderField');
      const genderError = page.locator('#genderError');
      
      // Trigger change event with empty selection
      await genderField.selectOption('');
      
      // Error should be visible
      await expect(genderError).toHaveClass(/show/);
    });

    test('should show error when level is not selected', async ({ page }) => {
      const levelField = page.locator('#levelField');
      const levelError = page.locator('#levelError');
      
      await levelField.selectOption('');
      
      await expect(levelError).toHaveClass(/show/);
    });

    test('should show error when type is not selected', async ({ page }) => {
      const typeField = page.locator('#typeField');
      const typeError = page.locator('#typeError');
      
      await typeField.selectOption('');
      
      await expect(typeError).toHaveClass(/show/);
    });

    test('should show error when no day of week is selected', async ({ page }) => {
      const dowError = page.locator('#dowError');
      
      // Both checkboxes should be unchecked by default
      const dowTuesday = page.locator('#dowTuesday');
      const dowFriday = page.locator('#dowFriday');
      
      await expect(dowTuesday).not.toBeChecked();
      await expect(dowFriday).not.toBeChecked();
      
      // Trigger validation by clicking and immediately checking error
      await dowTuesday.focus();
      await dowTuesday.blur();
      
      // Check if error is visible
      await expect(dowError).toHaveClass(/show/);
    });

    test('should hide error when valid value is entered', async ({ page }) => {
      const nameField = page.locator('#nameField');
      const nameError = page.locator('#nameError');
      
      // First trigger error by blurring empty
      await nameField.focus();
      await nameField.blur();
      await expect(nameError).toHaveClass(/show/);
      
      // Now enter valid value
      await nameField.fill('John Doe');
      
      // Error should be hidden
      await expect(nameError).not.toHaveClass(/show/);
    });
  });

  test.describe('Form submission validation', () => {
    
    test('should prevent submission when required fields are empty', async ({ page }) => {
      const submitButton = page.getByText('Submit', { exact: true });
      
      // Try to submit with empty form
      await submitButton.click();
      
      // Should still be on member-registration page
      expect(page.url()).toContain('/member-registration');
      
      // Error messages should be visible
      await expect(page.locator('#nameError')).toHaveClass(/show/);
      await expect(page.locator('#ageError')).toHaveClass(/show/);
      await expect(page.locator('#genderError')).toHaveClass(/show/);
      await expect(page.locator('#levelError')).toHaveClass(/show/);
      await expect(page.locator('#typeError')).toHaveClass(/show/);
      await expect(page.locator('#dowError')).toHaveClass(/show/);
      await expect(page.locator('#registrationDateError')).toHaveClass(/show/);
    });

    test('should allow submission when all required fields are valid', async ({ page }) => {
      // Fill all required fields
      await page.locator('#nameField').fill('Alice Johnson');
      await page.locator('#ageField').fill('28');
      await page.locator('#genderField').selectOption('Female');
      await page.locator('#levelField').selectOption('Intermediate');
      await page.locator('#typeField').selectOption('feather shuttle');
      await page.locator('#dowTuesday').check();
      await page.locator('#registrationDateField').fill('2024-01-15');
      
      // Submit form
      await page.getByText('Submit', { exact: true }).click();
      
      // Should redirect to home page on success
      await expect(page).toHaveURL(/\/member\/\d+$/);
    });
  });

  test.describe('Server-side validation', () => {
    
    test('should return validation errors when name is empty via POST', async ({ page }) => {
      // Submit form with only non-required fields filled
      const response = await page.request.post('/member-registration', {
        data: {
          name: '', // Empty name
          age: '25',
          gender: 'Male',
          level: 'Beginner',
          type: 'nylon shuttle',
          dow: 'Tuesday',
          registration_date: '2024-01-15'
        }
      });
      
      expect(response.status()).toBe(400); // Validation error returns 400
      const text = await response.text();
      expect(text).toContain('Name is required');
    });

    test('should return validation errors when age is invalid via POST', async ({ page }) => {
      const response = await page.request.post('/member-registration', {
        data: {
          name: 'Test User',
          age: '-5', // Negative age
          gender: 'Male',
          level: 'Beginner',
          type: 'feather shuttle',
          dow: 'Friday',
          registration_date: '2024-01-15'
        }
      });
      
      expect(response.status()).toBe(400);
      const text = await response.text();
      expect(text).toContain('Age is required and must be a valid positive number');
    });

    test('should return validation errors when gender is empty via POST', async ({ page }) => {
      const response = await page.request.post('/member-registration', {
        data: {
          name: 'Test User',
          age: '30',
          gender: '', // Empty gender
          level: 'Intermediate',
          type: 'nylon shuttle',
          dow: 'Tuesday',
          registration_date: '2024-01-15'
        }
      });
      
      expect(response.status()).toBe(400);
      const text = await response.text();
      expect(text).toContain('Gender must be one of');
    });

    test('should return validation errors when no day of week selected via POST', async ({ page }) => {
      const response = await page.request.post('/member-registration', {
        data: {
          name: 'Test User',
          age: '25',
          gender: 'Female',
          level: 'Expert',
          type: 'feather shuttle',
          registration_date: '2024-01-15'
          // No dow field
        }
      });
      
      expect(response.status()).toBe(400);
      const text = await response.text();
      expect(text).toContain('At least one day of the week must be selected');
    });

    test('should preserve form data when validation errors occur', async ({ page }) => {
      const testName = 'Bob Smith';
      const testAge = '35';
      
      // Submit form with missing required fields
      await page.locator('#nameField').fill(testName);
      await page.locator('#ageField').fill(testAge);
      await page.getByText('Submit', { exact: true }).click();
      
      // Form should re-render with errors
      await expect(page).toHaveURL(/\/member-registration/);
      
      // Form data should be preserved
      await expect(page.locator('#nameField')).toHaveValue(testName);
      await expect(page.locator('#ageField')).toHaveValue(testAge);
    });

    test('should successfully save member with valid data via POST', async ({ page, request }) => {
      const testName = `Member ${Date.now()}`;
      
      const response = await request.post('/member-registration', {
        data: {
          name: testName,
          team: 'RED',
          age: '32',
          gender: 'Male',
          level: 'Intermediate',
          type: 'feather shuttle',
          dow: ['Tuesday', 'Friday'],
          registration_date: '2024-01-15',
          memberHistory: 'Active member'
        }
      });
      
      expect(response.status()).toBe(200); // Successful submission redirects (302)
      
      // Should redirect to home page
      const finalUrl = response.url();
      expect(finalUrl).toContain('/');
      
      // Navigate to home and verify member was added
      await page.goto('/');
      // Check if new member appears in the list
      await expect(page.locator('body')).toContainText(testName);
    });
  });

  test.describe('Form field interaction', () => {
    
    test('should pre-populate form when server returns errors', async ({ page }) => {
      const testName = 'Charlie Brown';
      const testAge = '40';
      
      // Fill some fields and submit incomplete form
      await page.locator('#nameField').fill(testName);
      await page.locator('#ageField').fill(testAge);
      await page.getByText('Submit', { exact: true }).click();
      
      // Check that values are preserved
      await expect(page.locator('#nameField')).toHaveValue(testName);
      await expect(page.locator('#ageField')).toHaveValue(testAge);
    });

    test('should handle checkbox state preservation', async ({ page }) => {
      // Check Friday
      await page.locator('#dowFriday').check();
      await page.locator('#nameField').fill('Test User');
      
      // Submit incomplete form (missing required fields)
      await page.getByText('Submit', { exact: true }).click();
      
      // Friday should remain checked
      await expect(page.locator('#dowFriday')).toBeChecked();
      await expect(page.locator('#dowTuesday')).not.toBeChecked();
    });

    test('should handle select option preservation', async ({ page }) => {
      await page.locator('#genderField').selectOption('Female');
      await page.locator('#levelField').selectOption('Expert');
      
      // Submit incomplete form
      await page.getByText('Submit', { exact: true }).click();
      
      // Options should remain selected
      await expect(page.locator('#genderField')).toHaveValue('Female');
      await expect(page.locator('#levelField')).toHaveValue('Expert');
    });
  });

  test.describe('Error message display', () => {
    
    test('should show all error messages for empty form submission', async ({ page }) => {
      await page.getByText('Submit', { exact: true }).click();
      
      const expectedErrors = [
        '#nameError',
        '#ageError',
        '#genderError',
        '#levelError',
        '#typeError',
        '#dowError',
        '#registrationDateError'
      ];
      
      for (const errorSelector of expectedErrors) {
        const errorElement = page.locator(errorSelector);
        await expect(errorElement).toHaveClass(/show/);
      }
    });

    test('should clear error when user corrects field after blur', async ({ page }) => {
      const nameField = page.locator('#nameField');
      const nameError = page.locator('#nameError');
      
      // Trigger error
      await nameField.focus();
      await nameField.blur();
      await expect(nameError).toHaveClass(/show/);
      
      // Clear error
      await nameField.fill('Valid Name');
      await expect(nameError).not.toHaveClass(/show/);
    });
  });
});
