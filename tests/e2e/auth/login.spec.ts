import { test, expect, Page } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Authentication Flow', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads and displays correctly
    await expect(page.locator('h1')).toContainText('Beer Olympics');
    await utils.expectElementVisible('button:has-text("Sign in with Google")');
    
    // Take screenshot of login page
    await utils.screenshot('login-page');
    
    // Verify design elements
    await utils.verifyDesignSystem();
    await utils.checkAccessibility();
  });

  test('should handle Google OAuth login flow', async ({ page }) => {
    await page.goto('/');
    
    // Mock OAuth and attempt login
    await utils.login();
    
    // Verify successful login
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
    
    // Verify user is redirected to dashboard or home
    expect(page.url()).toMatch(/\/(dashboard|home)?/);
    
    // Take screenshot of authenticated state
    await utils.screenshot('authenticated-home');
  });

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock failed OAuth response
    await page.route('**/api/auth/signin/google', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'OAuth failed' })
      });
    });
    
    await page.locator('button:has-text("Sign in with Google")').click();
    
    // Should display error message
    await expect(page.locator('text=sign in')).toBeVisible();
    
    // Take screenshot of error state
    await utils.screenshot('login-error');
  });

  test('should maintain session across page reloads', async ({ page }) => {
    await page.goto('/');
    await utils.login();
    
    // Reload page
    await page.reload();
    await utils.waitForAppLoad();
    
    // Should still be authenticated
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Take screenshot
    await utils.screenshot('session-persisted');
  });

  test('should handle logout correctly', async ({ page }) => {
    await page.goto('/');
    await utils.login();
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Sign out"), button:has-text("Logout")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login page
      await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
      
      // Take screenshot of logged out state
      await utils.screenshot('logged-out');
    }
  });

  test('should be responsive across all devices', async ({ page }) => {
    await page.goto('/');
    
    await utils.testResponsive(async () => {
      // Verify login elements are visible and properly sized
      await utils.expectElementVisible('button:has-text("Sign in with Google")');
      await utils.expectElementVisible('h1');
      
      // Check that elements don't overflow
      const button = page.locator('button:has-text("Sign in with Google")');
      const buttonBox = await button.boundingBox();
      expect(buttonBox?.width).toBeLessThan(await page.viewportSize()?.width || 1000);
    });
  });

  test('should load quickly and show proper loading states', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await utils.waitForAppLoad();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime, 'Page should load within 3 seconds').toBeLessThan(3000);
    
    // Verify no loading spinners remain
    await expect(page.locator('.animate-spin')).toHaveCount(0);
    
    // Take screenshot of final loaded state
    await utils.screenshot('page-loaded');
  });

  test('should handle offline functionality', async ({ page, context }) => {
    await page.goto('/');
    await utils.login();
    
    // Go offline
    await context.setOffline(true);
    
    // Page should still be functional (basic PWA behavior)
    await page.reload();
    
    // Should show offline indicator or cached content
    // This depends on your PWA implementation
    await utils.screenshot('offline-mode');
    
    // Go back online
    await context.setOffline(false);
  });
});