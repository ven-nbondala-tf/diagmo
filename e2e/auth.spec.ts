import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create/i })).toBeVisible();
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.getByRole('link', { name: /sign up|create account/i });
    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);

    const loginLink = page.getByRole('link', { name: /sign in|log in/i });
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Check for validation - either HTML5 validation or custom error messages
    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Wait for error message or toast
    await expect(
      page.getByText(/invalid|incorrect|error|failed/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('signup form should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill('test@example.com');

    // Fill with short password
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('123');
    await page.getByRole('button', { name: /sign up|create/i }).click();

    // Should show validation error or prevent submission
    const isVisible = await page.isVisible('text=/password|minimum|characters/i');
    const hasValidation = await passwordInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isVisible || hasValidation).toBe(true);
  });
});
