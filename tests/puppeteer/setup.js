/**
 * Puppeteer Test Setup
 * Common utilities and helpers for Puppeteer tests
 */

// Extend Jest timeout for slow operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  /**
   * Wait for the app to be fully loaded
   */
  async waitForAppLoad(page) {
    await page.waitForSelector('[data-testid="app-loaded"]', { 
      timeout: 10000,
      visible: true 
    });
    
    // Wait for any loading spinners to disappear
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .animate-pulse');
      return loadingElements.length === 0;
    }, { timeout: 5000 });
  },

  /**
   * Mock Google OAuth for testing
   */
  async mockGoogleAuth(page, user = { name: 'Test User', email: 'test@example.com' }) {
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      const url = request.url();
      
      if (url.includes('/api/auth/signin/google')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: '/auth/callback' })
        });
      } else if (url.includes('/auth/callback')) {
        request.respond({
          status: 200,
          contentType: 'text/html',
          body: `<script>window.location.href = '/?auth=success';</script>`
        });
      } else if (url.includes('/api/auth/session')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        });
      } else {
        request.continue();
      }
    });
  },

  /**
   * Simulate user login
   */
  async login(page, user = { name: 'Test User', email: 'test@example.com' }) {
    await this.mockGoogleAuth(page, user);
    
    // Click login button if visible
    const loginButton = await page.$('button:contains("Sign in with Google")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForNavigation();
    }
    
    await this.waitForAppLoad(page);
  },

  /**
   * Take screenshot with timestamp
   */
  async screenshot(page, name) {
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `test-results/puppeteer-screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  },

  /**
   * Check if element is visible and properly styled
   */
  async expectElementVisible(page, selector, message) {
    const element = await page.$(selector);
    expect(element).toBeTruthy();
    
    const isVisible = await page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (!el) return false;
      
      const style = window.getComputedStyle(el);
      return style.opacity !== '0' && 
             style.visibility !== 'hidden' && 
             style.display !== 'none';
    }, selector);
    
    expect(isVisible).toBe(true);
  },

  /**
   * Test responsive design at different viewports
   */
  async testResponsive(page, callback) {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForTimeout(500); // Allow reflow
      await callback(viewport);
      await this.screenshot(page, `responsive-${viewport.name}`);
    }
  },

  /**
   * Verify images load correctly
   */
  async verifyImagesLoad(page) {
    const images = await page.$$('img');
    
    for (const img of images) {
      const src = await img.getProperty('src');
      const srcValue = await src.jsonValue();
      
      if (srcValue && !srcValue.startsWith('data:')) {
        const isLoaded = await img.evaluate(el => {
          return el.complete && el.naturalHeight !== 0;
        });
        expect(isLoaded).toBe(true);
      }
    }
  },

  /**
   * Check for console errors
   */
  async checkConsoleErrors(page) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  },

  /**
   * Verify PWA functionality
   */
  async testPWAFeatures(page) {
    // Check manifest
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });
    expect(manifest).toBe('/manifest.json');

    // Check service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  },

  /**
   * Verify accessibility basics
   */
  async checkAccessibility(page) {
    // Check for headings
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt attributes on images
    const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
    expect(imagesWithoutAlt).toBe(0);
  }
};

// Create screenshots directory
const fs = require('fs');
const path = require('path');
const screenshotDir = path.join(process.cwd(), 'test-results', 'puppeteer-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}