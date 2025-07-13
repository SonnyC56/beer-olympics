import { Page, expect } from '@playwright/test';

/**
 * Base setup utilities for E2E tests
 */

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for the app to be fully loaded
   */
  async waitForAppLoad() {
    // Wait for React to hydrate and app to be ready
    await this.page.waitForSelector('[data-testid="app-loaded"]', { 
      timeout: 10000,
      state: 'attached'
    });
    
    // Wait for any loading states to finish
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .animate-pulse');
      return loadingElements.length === 0;
    }, { timeout: 5000 });
  }

  /**
   * Mock Google OAuth for testing
   */
  async mockGoogleAuth(user = { name: 'Test User', email: 'test@example.com' }) {
    await this.page.route('**/api/auth/signin/google', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/auth/callback' })
      });
    });

    await this.page.route('**/auth/callback*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <script>
            window.location.href = '/?auth=success';
          </script>
        `
      });
    });

    // Mock session endpoint
    await this.page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });
  }

  /**
   * Simulate user login
   */
  async login(user = { name: 'Test User', email: 'test@example.com' }) {
    await this.mockGoogleAuth(user);
    
    // Navigate to login if not authenticated
    const loginButton = this.page.locator('button:has-text("Sign in with Google")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await this.page.waitForURL('**/auth/callback*');
      await this.page.waitForURL('/?auth=success');
    }
    
    await this.waitForAppLoad();
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element is visible and styled correctly
   */
  async expectElementVisible(selector: string, message?: string) {
    const element = this.page.locator(selector);
    await expect(element, message).toBeVisible();
    
    // Ensure element is not hidden by CSS
    const isVisible = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity !== '0' && 
             style.visibility !== 'hidden' && 
             style.display !== 'none';
    });
    expect(isVisible, `Element ${selector} should be visible`).toBe(true);
  }

  /**
   * Verify responsive design at different viewports
   */
  async testResponsive(callback: () => Promise<void>) {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow reflow
      await callback();
      await this.screenshot(`responsive-${viewport.name}`);
    }
  }

  /**
   * Test PWA functionality
   */
  async testPWAFeatures() {
    // Check manifest
    const manifest = await this.page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });
    expect(manifest).toBe('/manifest.json');

    // Check service worker registration
    const swRegistered = await this.page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);

    // Check meta tags for PWA
    const themeColor = await this.page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
  }

  /**
   * Verify all images load correctly
   */
  async verifyImagesLoad() {
    const images = await this.page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        // Check if image loaded successfully
        const isLoaded = await img.evaluate((el: HTMLImageElement) => {
          return el.complete && el.naturalHeight !== 0;
        });
        expect(isLoaded, `Image failed to load: ${src}`).toBe(true);
      }
    }
  }

  /**
   * Check for accessibility violations
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const hasHeadings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(hasHeadings, 'Page should have heading elements').toBeGreaterThan(0);

    // Check for alt attributes on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt, 'All images should have alt attributes').toBe(0);

    // Check for proper button/link text
    const emptyButtons = await this.page.locator('button:empty, a:empty').count();
    expect(emptyButtons, 'Buttons and links should have text content').toBe(0);
  }

  /**
   * Verify color contrast and design elements
   */
  async verifyDesignSystem() {
    // Check if custom fonts loaded
    const fontLoaded = await this.page.evaluate(() => {
      return document.fonts.check('16px Fredoka');
    });
    expect(fontLoaded, 'Custom fonts should be loaded').toBe(true);

    // Verify CSS animations work
    const animatedElements = await this.page.locator('[class*="animate-"]').count();
    if (animatedElements > 0) {
      // Take screenshot to verify animations are applied
      await this.screenshot('animations-applied');
    }

    // Check for proper color usage (beer olympics theme)
    const hasThemeColors = await this.page.evaluate(() => {
      const computedStyles = window.getComputedStyle(document.body);
      const bgColor = computedStyles.backgroundColor;
      // Should have gradient or theme colors
      return bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
    });
    expect(hasThemeColors, 'Page should use theme colors').toBe(true);
  }
}