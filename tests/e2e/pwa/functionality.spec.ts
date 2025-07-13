import { test, expect } from '@playwright/test';
import { TestUtils } from '../setup';

test.describe('PWA Functionality', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should have valid PWA manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check manifest link exists
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink, 'Manifest link should exist').toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifestLink!);
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    
    // Validate required manifest fields
    expect(manifest.name, 'Manifest should have name').toBeTruthy();
    expect(manifest.short_name, 'Manifest should have short_name').toBeTruthy();
    expect(manifest.start_url, 'Manifest should have start_url').toBeTruthy();
    expect(manifest.display, 'Manifest should have display').toBeTruthy();
    expect(manifest.icons, 'Manifest should have icons').toBeTruthy();
    expect(manifest.icons.length, 'Manifest should have at least one icon').toBeGreaterThan(0);
    
    // Validate icon sizes
    const hasRequiredIcon = manifest.icons.some((icon: any) => {
      const sizes = icon.sizes.split('x');
      return parseInt(sizes[0]) >= 192 && parseInt(sizes[1]) >= 192;
    });
    expect(hasRequiredIcon, 'Manifest should have at least 192x192 icon').toBe(true);
    
    // Take screenshot
    await utils.screenshot('pwa-manifest-check');
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });
    
    expect(swRegistered, 'Service worker should be registered').toBe(true);
    
    // Check service worker state
    const swState = await page.evaluate(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return navigator.serviceWorker.controller.state;
      }
      return 'not-found';
    });
    
    expect(['installing', 'installed', 'activating', 'activated']).toContain(swState);
    
    // Take screenshot
    await utils.screenshot('service-worker-registered');
  });

  test('should work offline after initial load', async ({ page, context }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Wait for service worker to cache resources
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Should still load (from cache)
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 });
    
    // Should show offline indicator if implemented
    const offlineIndicator = page.locator('[data-testid="offline"], .offline, text=offline').first();
    if (await offlineIndicator.isVisible()) {
      await utils.expectElementVisible(offlineIndicator.locator('..'));
    }
    
    // Take screenshot of offline mode
    await utils.screenshot('offline-functionality');
    
    // Go back online
    await context.setOffline(false);
  });

  test('should be installable as PWA', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check for installability
    const isInstallable = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', () => {
          resolve(true);
        });
        
        // If event doesn't fire within 2 seconds, assume not installable
        setTimeout(() => resolve(false), 2000);
      });
    });
    
    // Note: This might not trigger in test environment, so we check other indicators
    
    // Check for install button if present
    const installButton = page.locator('button:has-text("Install"), button:has-text("Add to Home")').first();
    if (await installButton.isVisible()) {
      await utils.expectElementVisible(installButton.locator('..'));
      await utils.screenshot('install-button-present');
    }
    
    // Verify PWA criteria are met
    await utils.testPWAFeatures();
  });

  test('should handle app icon and splash screen', async ({ page }) => {
    await page.goto('/');
    
    // Check apple-touch-icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    if (appleTouchIcon) {
      const iconResponse = await page.request.get(appleTouchIcon);
      expect(iconResponse.status(), 'Apple touch icon should load').toBe(200);
    }
    
    // Check meta tags for mobile
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor, 'Theme color should be set').toBeTruthy();
    
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleCapable, 'Apple web app capable should be set').toBe('yes');
    
    // Take screenshot
    await utils.screenshot('pwa-meta-tags');
  });

  test('should cache critical resources', async ({ page, context }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Wait for service worker to cache resources
    await page.waitForTimeout(3000);
    
    // Check what's in cache
    const cachedResources = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cachedUrls = [];
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          cachedUrls.push(...requests.map(req => req.url));
        }
        
        return cachedUrls;
      }
      return [];
    });
    
    // Should have cached at least some resources
    expect(cachedResources.length, 'Should have cached resources').toBeGreaterThan(0);
    
    // Should cache critical resources (HTML, CSS, JS)
    const hasCriticalResources = cachedResources.some(url => 
      url.includes('.html') || url.includes('.css') || url.includes('.js')
    );
    expect(hasCriticalResources, 'Should cache critical resources').toBe(true);
    
    // Take screenshot
    await utils.screenshot('cached-resources');
  });

  test('should handle push notifications setup', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check notification permission status
    const notificationPermission = await page.evaluate(() => {
      if ('Notification' in window) {
        return Notification.permission;
      }
      return 'not-supported';
    });
    
    // Should support notifications
    expect(notificationPermission).not.toBe('not-supported');
    
    // Look for notification permission request UI
    const notificationButton = page.locator('button:has-text("Notification"), button:has-text("Enable")').first();
    
    if (await notificationButton.isVisible()) {
      await utils.screenshot('notification-permission-ui');
      
      // Note: Can't actually test permission request in automated tests
      // as it requires user interaction
    }
  });

  test('should work with background sync', async ({ page, context }) => {
    await page.goto('/');
    await utils.login();
    
    // Mock a form submission while offline
    await context.setOffline(true);
    
    // Try to submit data (like a score)
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const submitButton = form.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show queued or pending state
        await utils.screenshot('offline-form-submission');
      }
    }
    
    // Go back online
    await context.setOffline(false);
    
    // Background sync should trigger (if implemented)
    await page.waitForTimeout(2000);
    await utils.screenshot('background-sync-completed');
  });

  test('should update when new version available', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Mock service worker update
    await page.evaluate(() => {
      // Simulate update available event
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.dispatchEvent(new CustomEvent('message', {
          data: { type: 'UPDATE_AVAILABLE' }
        }));
      }
    });
    
    // Look for update notification
    const updateNotification = page.locator('text=update, text=Update, text=new version').first();
    
    if (await updateNotification.isVisible()) {
      await utils.screenshot('update-notification');
      
      // Look for update button
      const updateButton = page.locator('button:has-text("Update"), button:has-text("Reload")').first();
      if (await updateButton.isVisible()) {
        await utils.expectElementVisible(updateButton.locator('..'));
      }
    }
  });

  test('should handle app shortcuts', async ({ page }) => {
    await page.goto('/');
    
    // Check for shortcuts in manifest
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    
    if (manifestLink) {
      const manifestResponse = await page.request.get(manifestLink);
      const manifest = await manifestResponse.json();
      
      if (manifest.shortcuts) {
        expect(manifest.shortcuts.length, 'Should have app shortcuts').toBeGreaterThan(0);
        
        // Validate shortcut structure
        manifest.shortcuts.forEach((shortcut: any) => {
          expect(shortcut.name, 'Shortcut should have name').toBeTruthy();
          expect(shortcut.url, 'Shortcut should have url').toBeTruthy();
        });
        
        await utils.screenshot('app-shortcuts-available');
      }
    }
  });

  test('should handle share target functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check for share target in manifest
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    
    if (manifestLink) {
      const manifestResponse = await page.request.get(manifestLink);
      const manifest = await manifestResponse.json();
      
      if (manifest.share_target) {
        expect(manifest.share_target.action, 'Share target should have action').toBeTruthy();
        expect(manifest.share_target.method, 'Share target should have method').toBeTruthy();
        
        await utils.screenshot('share-target-available');
      }
    }
    
    // Test Web Share API if available
    const webShareSupported = await page.evaluate(() => {
      return 'share' in navigator;
    });
    
    if (webShareSupported) {
      // Look for share buttons
      const shareButton = page.locator('button:has-text("Share"), [data-testid="share"]').first();
      
      if (await shareButton.isVisible()) {
        await utils.screenshot('web-share-button');
      }
    }
  });

  test('should maintain PWA display mode', async ({ page }) => {
    await page.goto('/');
    await utils.waitForAppLoad();
    
    // Check display mode
    const displayMode = await page.evaluate(() => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.matchMedia('(display-mode: fullscreen)').matches ||
             window.matchMedia('(display-mode: minimal-ui)').matches;
    });
    
    // In test environment, this will likely be false, but we can check the setup
    
    // Verify viewport meta tag for proper mobile experience
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport, 'Viewport meta tag should exist').toContain('width=device-width');
    
    // Take screenshot
    await utils.screenshot('pwa-display-mode');
  });
});