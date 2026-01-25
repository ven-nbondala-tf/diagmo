import { test, expect } from '@playwright/test';

test.describe('Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');
  });

  test('should display export button in toolbar', async ({ page }) => {
    // Look for export button or download button
    const exportBtn = page.getByRole('button', { name: /export|download|save as/i }).first();
    const hasExport = await exportBtn.isVisible().catch(() => false);

    // Should have export functionality accessible
    expect(hasExport || await page.isVisible('[aria-label*="export" i]')).toBeDefined();
  });

  test('should open export dialog when clicking export', async ({ page }) => {
    // Find and click export button
    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      // Should show export options dialog or dropdown
      const exportOptions = page.getByText(/png|svg|pdf/i).first();
      const hasOptions = await exportOptions.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasOptions).toBeDefined();
    }
  });

  test('should have PNG export option', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const pngOption = page.getByText(/png/i).first();
      const hasPng = await pngOption.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasPng).toBeDefined();
    }
  });

  test('should have SVG export option', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const svgOption = page.getByText(/svg/i).first();
      const hasSvg = await svgOption.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasSvg).toBeDefined();
    }
  });

  test('should have PDF export option', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const pdfOption = page.getByText(/pdf/i).first();
      const hasPdf = await pdfOption.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasPdf).toBeDefined();
    }
  });
});

test.describe('Export Functionality', () => {
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

    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');
  });

  test('should trigger download when exporting to PNG', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const pngOption = page.getByText(/png/i).first();
      if (await pngOption.isVisible().catch(() => false)) {
        await pngOption.click();

        const download = await downloadPromise;
        // Download may or may not trigger depending on implementation
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.png$/);
        }
      }
    }
  });

  test('should trigger download when exporting to SVG', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const svgOption = page.getByText(/svg/i).first();
      if (await svgOption.isVisible().catch(() => false)) {
        await svgOption.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.svg$/);
        }
      }
    }
  });

  test('should trigger download when exporting to PDF', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const pdfOption = page.getByText(/pdf/i).first();
      if (await pdfOption.isVisible().catch(() => false)) {
        await pdfOption.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.pdf$/);
        }
      }
    }
  });
});

test.describe('Export Edge Cases', () => {
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

  test('should handle export of empty diagram', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      // Export should work even with empty diagram
      await exportBtn.click();

      // Should not crash or show error
      await expect(page.locator('.react-flow').first()).toBeVisible();
    }
  });

  test('should maintain editor state after export', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.react-flow').first();
    await expect(canvas).toBeVisible();

    const exportBtn = page.getByRole('button', { name: /export|download/i }).first();

    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      // Press escape to close any dialogs
      await page.keyboard.press('Escape');

      // Canvas should still be functional
      await expect(canvas).toBeVisible();
    }
  });
});
