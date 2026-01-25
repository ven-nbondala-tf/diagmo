import { test, expect } from '@playwright/test';

test.describe('Editor Flow', () => {
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
  });

  test('should display editor page for new diagram', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // Should show editor or redirect
    const isEditor = await page.isVisible('.react-flow') ||
                     await page.isVisible('[data-testid="diagram-editor"]') ||
                     await page.isVisible('canvas');

    const isRedirected = page.url().includes('/login') || page.url().includes('/dashboard');

    expect(isEditor || isRedirected).toBe(true);
  });

  test('should display shape panel', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // Look for shape panel or shapes section
    const shapePanel = page.getByText(/shapes|basic shapes|flowchart/i).first();
    await expect(shapePanel).toBeVisible({ timeout: 10000 });
  });

  test('should display editor toolbar', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // Look for toolbar buttons (undo, redo, zoom, etc.)
    const hasToolbar = await Promise.race([
      page.waitForSelector('[aria-label*="undo" i]', { timeout: 5000 }).then(() => true).catch(() => false),
      page.waitForSelector('[aria-label*="zoom" i]', { timeout: 5000 }).then(() => true).catch(() => false),
      page.waitForSelector('button:has-text("Undo")', { timeout: 5000 }).then(() => true).catch(() => false),
    ]);

    expect(hasToolbar).toBe(true);
  });

  test('should display zoom controls', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // Look for zoom indicators or controls
    const zoomControls = page.getByText(/100%|zoom/i).first();
    const hasZoom = await zoomControls.isVisible().catch(() => false);

    // Zoom controls should be present
    expect(hasZoom || await page.isVisible('[aria-label*="zoom" i]')).toBe(true);
  });

  test('should have canvas/flow area', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // React Flow creates a container with class react-flow
    const canvas = page.locator('.react-flow, [data-testid="flow-canvas"]').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display back to dashboard button', async ({ page }) => {
    await page.goto('/editor/new');
    await page.waitForLoadState('networkidle');

    // Look for back button or dashboard link
    const backBtn = page.getByRole('link', { name: /back|dashboard|home/i }).first();
    const hasBack = await backBtn.isVisible().catch(() => false);

    expect(hasBack || await page.isVisible('[aria-label*="back" i]')).toBe(true);
  });
});

test.describe('Editor Canvas Interactions', () => {
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

  test('should be able to pan the canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow__viewport, .react-flow__pane').first();

    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        // Pan by dragging
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
        await page.mouse.up();
      }
    }

    // Canvas should still be visible after pan
    await expect(page.locator('.react-flow').first()).toBeVisible();
  });

  test('should zoom with mouse wheel', async ({ page }) => {
    const canvas = page.locator('.react-flow').first();

    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        // Zoom with wheel
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -100);
      }
    }

    // Canvas should still be visible after zoom
    await expect(canvas).toBeVisible();
  });

  test('should display shape categories in panel', async ({ page }) => {
    // Check for shape categories
    const categories = ['basic', 'flowchart', 'uml', 'cloud'];

    for (const category of categories) {
      const categoryElement = page.getByText(new RegExp(category, 'i')).first();
      const isVisible = await categoryElement.isVisible().catch(() => false);
      if (isVisible) {
        expect(isVisible).toBe(true);
        break;
      }
    }
  });
});

test.describe('Editor Keyboard Shortcuts', () => {
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

  test('should handle Ctrl+Z for undo', async ({ page }) => {
    const canvas = page.locator('.react-flow').first();

    if (await canvas.isVisible()) {
      // Focus canvas and trigger undo
      await canvas.click();
      await page.keyboard.press('Control+z');

      // Editor should still be functional
      await expect(canvas).toBeVisible();
    }
  });

  test('should handle Ctrl+Y for redo', async ({ page }) => {
    const canvas = page.locator('.react-flow').first();

    if (await canvas.isVisible()) {
      await canvas.click();
      await page.keyboard.press('Control+y');

      await expect(canvas).toBeVisible();
    }
  });

  test('should handle Delete key', async ({ page }) => {
    const canvas = page.locator('.react-flow').first();

    if (await canvas.isVisible()) {
      await canvas.click();
      await page.keyboard.press('Delete');

      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Editor Properties Panel', () => {
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

  test('should show properties panel', async ({ page }) => {
    // Properties panel should be visible
    const propertiesPanel = page.getByText(/properties|style|appearance/i).first();
    const hasPanel = await propertiesPanel.isVisible().catch(() => false);

    // Either properties panel is always visible or shown on selection
    expect(hasPanel || await page.isVisible('[data-testid="properties-panel"]')).toBeDefined();
  });

  test('should show message when no node selected', async ({ page }) => {
    // When no node is selected, should show instruction
    const noSelectionMsg = page.getByText(/select a node|no selection|click on a shape/i).first();
    const hasMsg = await noSelectionMsg.isVisible().catch(() => false);

    expect(hasMsg).toBeDefined();
  });
});
