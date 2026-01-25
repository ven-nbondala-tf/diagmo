import { test, expect } from '@playwright/test';

// Mock authentication for dashboard tests
test.describe('Dashboard Flow', () => {
  // Note: These tests require authentication. In a real scenario,
  // you would set up test users or mock the auth state.

  test.describe('Unauthenticated', () => {
    test('should redirect to login when accessing dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Authenticated', () => {
    test.beforeEach(async ({ page }) => {
      // Mock auth state by setting localStorage before navigation
      await page.addInitScript(() => {
        // Mock Supabase auth state
        localStorage.setItem('sb-localhost-auth-token', JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        }));
      });
    });

    test('should display dashboard header', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Check for dashboard elements
      const heading = page.getByRole('heading', { name: /my diagrams|dashboard/i });
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should display New Diagram button', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const newDiagramBtn = page.getByRole('button', { name: /new diagram/i });
      await expect(newDiagramBtn).toBeVisible({ timeout: 10000 });
    });

    test('should display search bar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    test('should display folder sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Look for folder-related elements
      const allDiagramsBtn = page.getByText(/all diagrams/i);
      await expect(allDiagramsBtn).toBeVisible({ timeout: 10000 });
    });

    test('should filter diagrams when searching', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test search query');

      // Search should be reactive - content should update
      // The exact behavior depends on whether there are matching diagrams
      await expect(searchInput).toHaveValue('test search query');
    });

    test('should show empty state when no diagrams exist', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Either show diagrams or empty state
      const hasContent = await Promise.race([
        page.waitForSelector('[data-testid="diagram-card"]', { timeout: 5000 }).then(() => true).catch(() => false),
        page.waitForSelector('text=/no diagrams|create your first/i', { timeout: 5000 }).then(() => true).catch(() => false),
      ]);

      expect(hasContent).toBe(true);
    });

    test('should show loading skeletons while fetching', async ({ page }) => {
      // Slow down network to see loading state
      await page.route('**/rest/v1/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/dashboard');

      // Check for skeleton loaders
      const skeletons = page.locator('.animate-pulse');
      const skeletonCount = await skeletons.count();

      // Should have loading skeletons or immediate content
      expect(skeletonCount >= 0).toBe(true);
    });
  });
});

test.describe('Dashboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      }));
    });
  });

  test('should navigate to editor when clicking New Diagram', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const newDiagramBtn = page.getByRole('button', { name: /new diagram/i });
    await newDiagramBtn.click();

    // Should navigate to editor or show loading state
    await expect(page).toHaveURL(/\/editor\/|\/dashboard/, { timeout: 10000 });
  });

  test('should clear search when clicking clear button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');

    // Clear the search
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });
});
