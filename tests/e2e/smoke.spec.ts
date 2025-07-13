import { test, expect } from '@playwright/test';
import { TestUtils } from './setup';

test.describe('Smoke Tests - Basic Functionality', () => {
  test('should load homepage and basic elements', async ({ page }) => {
    const utils = new TestUtils(page);
    
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Basic page structure
    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(logs.length, 'Should have no console errors').toBe(0);
    
    // Take screenshot
    await utils.screenshot('homepage-smoke-test');
  });

  test('should have proper meta tags and PWA setup', async ({ page }) => {
    await page.goto('/');
    
    // Check essential meta tags
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.json');
    
    // Check title
    const title = await page.title();
    expect(title).toContain('Beer Olympics');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375 + 5);
    
    // Basic elements should be visible
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    expect(errors, 'Should have no JavaScript errors').toHaveLength(0);
  });
});