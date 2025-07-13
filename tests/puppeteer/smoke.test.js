/**
 * Puppeteer Smoke Tests
 * Basic functionality verification
 */

describe('Smoke Tests - Basic Functionality', () => {
  test('should load homepage and basic elements', async () => {
    await page.goto('http://localhost:5173');
    await testUtils.waitForAppLoad(page);
    
    // Basic page structure
    await expect(page).toMatchElement('h1, h2');
    await expect(page).toMatchElement('body');
    
    // Verify no console errors
    const errors = await testUtils.checkConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    // Take screenshot
    await testUtils.screenshot(page, 'homepage-smoke-test');
  });

  test('should have proper meta tags and PWA setup', async () => {
    await page.goto('http://localhost:5173');
    
    // Check essential meta tags
    const viewport = await page.$eval('meta[name="viewport"]', el => el.content);
    expect(viewport).toMatch(/width=device-width/);
    
    const manifest = await page.$eval('link[rel="manifest"]', el => el.href);
    expect(manifest).toContain('/manifest.json');
    
    // Check title
    const title = await page.title();
    expect(title).toContain('Beer Olympics');
  });

  test('should be responsive on mobile', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375 + 5);
    
    // Basic elements should be visible
    await expect(page).toMatchElement('h1, h2');
  });

  test('should load without JavaScript errors', async () => {
    const errors = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    expect(errors).toHaveLength(0);
  });

  test('should verify PWA functionality', async () => {
    await page.goto('http://localhost:5173');
    await testUtils.testPWAFeatures(page);
  });

  test('should load all images correctly', async () => {
    await page.goto('http://localhost:5173');
    await testUtils.verifyImagesLoad(page);
  });

  test('should have proper accessibility', async () => {
    await page.goto('http://localhost:5173');
    await testUtils.checkAccessibility(page);
  });
});