import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('Design System & Responsive Layout', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should display correct Beer Olympics branding', async ({ page }) => {
    await page.goto('/');
    
    // Verify branding elements
    await utils.expectElementVisible('text=Beer Olympics');
    
    // Check for logo or icon
    const logo = page.locator('img[alt*="logo"], img[alt*="Beer Olympics"], [data-testid="logo"]').first();
    if (await logo.isVisible()) {
      await utils.expectElementVisible(logo.locator('..'));
    }
    
    // Verify theme colors are applied
    const hasGradientBg = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      const bgImage = computedStyle.backgroundImage;
      return bgImage.includes('gradient') || bgImage.includes('linear');
    });
    
    expect(hasGradientBg, 'Should have gradient background').toBe(true);
    
    // Take screenshot of branding
    await utils.screenshot('branding-elements');
  });

  test('should use consistent typography across pages', async ({ page }) => {
    const pages = ['/', '/leaderboard/test-tournament', '/join/test-tournament'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await utils.waitForAppLoad();
      
      // Check font families
      const headingFont = await page.locator('h1, h2').first().evaluate(el => {
        return window.getComputedStyle(el).fontFamily;
      });
      
      expect(headingFont, 'Headings should use consistent font').toContain('Fredoka');
      
      // Check for proper font loading
      const fontLoaded = await page.evaluate(() => {
        return document.fonts.check('16px Fredoka') && document.fonts.check('16px Nunito');
      });
      
      expect(fontLoaded, 'Custom fonts should be loaded').toBe(true);
      
      // Take screenshot for each page
      await utils.screenshot(`typography-${pagePath.replace(/\//g, '-')}`);
    }
  });

  test('should maintain color consistency and accessibility', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check primary button colors
    const primaryButton = page.locator('button:not([disabled])').first();
    
    if (await primaryButton.isVisible()) {
      const buttonColors = await primaryButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor
        };
      });
      
      // Verify colors are not default (should be themed)
      expect(buttonColors.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(buttonColors.backgroundColor).not.toBe('transparent');
    }
    
    // Test color contrast (basic check)
    const textElements = await page.locator('p, h1, h2, h3, span').all();
    
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const element = textElements[i];
      if (await element.isVisible()) {
        const contrast = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Basic contrast check - should not be same color as background
          return color !== backgroundColor;
        });
        
        expect(contrast, 'Text should have contrast with background').toBe(true);
      }
    }
    
    // Take screenshot for color analysis
    await utils.screenshot('color-consistency');
  });

  test('should be fully responsive on mobile devices', async ({ page }) => {
    const mobileViewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 414, height: 896, name: 'iPhone 11' }
    ];
    
    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await utils.waitForAppLoad();
      
      // Verify no horizontal scrolling
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyScrollWidth, `No horizontal scroll on ${viewport.name}`).toBeLessThanOrEqual(viewport.width + 5);
      
      // Verify touch targets are adequate size
      const buttons = await page.locator('button, a, input[type="submit"]').all();
      
      for (const button of buttons.slice(0, 3)) { // Check first 3 buttons
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height, 'Touch targets should be at least 44px').toBeGreaterThanOrEqual(44);
            expect(box.width, 'Touch targets should be at least 44px').toBeGreaterThanOrEqual(44);
          }
        }
      }
      
      // Take screenshot
      await utils.screenshot(`mobile-${viewport.name.replace(/\s/g, '-')}`);
    }
  });

  test('should be fully responsive on tablet devices', async ({ page }) => {
    const tabletViewports = [
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 820, height: 1180, name: 'iPad Air' }
    ];
    
    for (const viewport of tabletViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await utils.waitForAppLoad();
      
      // Verify layout adapts properly
      await utils.expectElementVisible('h1, h2');
      
      // Check navigation is accessible
      const navElements = page.locator('nav, .navigation, [role="navigation"]');
      if ((await navElements.count()) > 0) {
        await utils.expectElementVisible(navElements.first().locator('..'));
      }
      
      // Take screenshot
      await utils.screenshot(`tablet-${viewport.name.replace(/\s/g, '-')}`);
    }
  });

  test('should be fully responsive on desktop devices', async ({ page }) => {
    const desktopViewports = [
      { width: 1280, height: 720, name: 'Laptop' },
      { width: 1440, height: 900, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' },
      { width: 2560, height: 1440, name: 'Ultra Wide' }
    ];
    
    for (const viewport of desktopViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await utils.waitForAppLoad();
      
      // Verify content uses available space effectively
      const mainContent = page.locator('main, .main-content, .container').first();
      
      if (await mainContent.isVisible()) {
        const contentBox = await mainContent.boundingBox();
        if (contentBox) {
          // Content should not be too narrow on large screens
          expect(contentBox.width, 'Content should use adequate width on large screens').toBeGreaterThan(800);
        }
      }
      
      // Take screenshot
      await utils.screenshot(`desktop-${viewport.name.replace(/\s/g, '-')}`);
    }
  });

  test('should handle orientation changes gracefully', async ({ page }) => {
    // Test portrait to landscape transition
    await page.setViewportSize({ width: 375, height: 667 }); // Portrait
    await page.goto('/');
    await utils.waitForAppLoad();
    await utils.screenshot('orientation-portrait');
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape
    await page.waitForTimeout(500); // Allow layout reflow
    
    // Verify layout still works
    await utils.expectElementVisible('h1, h2');
    await utils.screenshot('orientation-landscape');
    
    // Check no horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(667 + 5);
  });

  test('should display animations and interactions correctly', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Look for animated elements
    const animatedElements = page.locator('[class*="animate-"], .animated, [data-animate]');
    const animationCount = await animatedElements.count();
    
    if (animationCount > 0) {
      // Take screenshot to capture animations
      await utils.screenshot('animations-present');
      
      // Verify animations don't cause layout shift
      for (let i = 0; i < Math.min(animationCount, 3); i++) {
        const element = animatedElements.nth(i);
        if (await element.isVisible()) {
          const initialBox = await element.boundingBox();
          await page.waitForTimeout(1000); // Wait for animation
          const finalBox = await element.boundingBox();
          
          // Position shouldn't shift dramatically (within 10px)
          if (initialBox && finalBox) {
            const shiftX = Math.abs(initialBox.x - finalBox.x);
            const shiftY = Math.abs(initialBox.y - finalBox.y);
            expect(shiftX, 'Animation should not cause major layout shift').toBeLessThan(10);
            expect(shiftY, 'Animation should not cause major layout shift').toBeLessThan(10);
          }
        }
      }
    }
  });

  test('should handle hover and focus states correctly', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Test button hover states
    const buttons = await page.locator('button:visible').all();
    
    if (buttons.length > 0) {
      const firstButton = buttons[0];
      
      // Take screenshot of initial state
      await utils.screenshot('button-initial-state');
      
      // Hover over button
      await firstButton.hover();
      await page.waitForTimeout(300); // Wait for hover transition
      
      // Take screenshot of hover state
      await utils.screenshot('button-hover-state');
      
      // Test focus state
      await firstButton.focus();
      await page.waitForTimeout(300);
      
      // Should have visible focus indicator
      const focusIndicator = await firstButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow.includes('ring') || styles.borderColor !== 'rgba(0, 0, 0, 0)';
      });
      
      expect(focusIndicator, 'Button should have visible focus indicator').toBe(true);
      
      // Take screenshot of focus state
      await utils.screenshot('button-focus-state');
    }
  });

  test('should handle image loading and optimization', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Verify all images load
    await utils.verifyImagesLoad();
    
    // Check for lazy loading attributes
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const loading = await img.getAttribute('loading');
      const src = await img.getAttribute('src');
      
      // Images should have proper loading attributes or be optimized
      if (src && !src.startsWith('data:')) {
        // Either lazy loading or eager loading should be specified
        expect(loading, 'Images should have loading attribute').toBeTruthy();
      }
    }
    
    // Take screenshot with all images loaded
    await utils.screenshot('images-loaded');
  });

  test('should maintain consistent spacing and layout', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check consistent margins and padding
    const sections = await page.locator('section, .section, .card, .container').all();
    
    if (sections.length > 1) {
      // Verify sections have consistent spacing
      for (let i = 0; i < Math.min(sections.length, 3); i++) {
        const section = sections[i];
        if (await section.isVisible()) {
          const spacing = await section.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              marginTop: parseFloat(styles.marginTop),
              marginBottom: parseFloat(styles.marginBottom),
              paddingTop: parseFloat(styles.paddingTop),
              paddingBottom: parseFloat(styles.paddingBottom)
            };
          });
          
          // Should have some spacing (not zero)
          const hasSpacing = spacing.marginTop > 0 || spacing.marginBottom > 0 || 
                           spacing.paddingTop > 0 || spacing.paddingBottom > 0;
          expect(hasSpacing, 'Sections should have proper spacing').toBe(true);
        }
      }
    }
    
    // Take screenshot for spacing analysis
    await utils.screenshot('layout-spacing');
  });

  test('should handle dark mode or theme switching', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Look for theme toggle
    const themeToggle = page.locator('button:has-text("Dark"), button:has-text("Light"), [data-testid="theme-toggle"]').first();
    
    if (await themeToggle.isVisible()) {
      // Take screenshot of default theme
      await utils.screenshot('default-theme');
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      // Take screenshot of toggled theme
      await utils.screenshot('toggled-theme');
      
      // Verify theme actually changed
      const bodyClasses = await page.locator('body').getAttribute('class');
      expect(bodyClasses, 'Body should have theme class').toContain('dark');
    }
  });
});